-- Phase 4 — website order creation.

-- ─────────────────────────────────────────────────────────────────
-- advance_required follows is_first_order, but only for website
-- orders (§0: "a customer's first order requires full advance
-- payment"). Scoped to source='website' on purpose: manual admin entry
-- in Phase 5 sets its own payment terms and must not be overridden here.
--
-- Runs as trg_03 so it fires after trg_02_customer_upsert has resolved
-- is_first_order — BEFORE triggers fire in name order.
-- ─────────────────────────────────────────────────────────────────
create or replace function public.set_website_advance_required()
returns trigger
language plpgsql
as $$
begin
  if new.source = 'website' then
    new.advance_required := new.is_first_order;
  end if;
  return new;
end;
$$;

create trigger trg_03_advance_required
  before insert on public.orders
  for each row
  execute function public.set_website_advance_required();

-- ─────────────────────────────────────────────────────────────────
-- create_website_order — order + order_items + the opening
-- order_events row, atomically. A plpgsql function body is a single
-- transaction, so a failure part-way through rolls back the whole
-- order rather than leaving an order with no items.
--
-- Totals are NOT recalculated here: the server action recomputes them
-- from database prices before calling this (§8 rule 7), and this
-- function is unreachable from the browser (see the REVOKE below).
--
-- SECURITY INVOKER by design — it is only ever called with the
-- service-role key from a server action.
-- ─────────────────────────────────────────────────────────────────
create or replace function public.create_website_order(
  p_customer_name text,
  p_phone text,
  p_whatsapp text,
  p_fulfillment text,
  p_delivery_area_id uuid,
  p_address text,
  p_required_date date,
  p_time_slot text,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_late_night_fee numeric,
  p_total numeric,
  p_payment_method text,
  p_payment_proof_url text,
  p_occasion text,
  p_occasion_person text,
  p_occasion_date date,
  p_customer_note text,
  p_items jsonb
)
returns table (
  order_id uuid,
  order_number text,
  is_first_order boolean,
  advance_required boolean
)
language plpgsql
as $$
declare
  v_order public.orders;
  v_item jsonb;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one item';
  end if;

  insert into public.orders (
    source, customer_name, phone, whatsapp, fulfillment, delivery_area_id, address,
    required_date, time_slot, subtotal, delivery_fee, late_night_fee, total,
    payment_method, payment_proof_url, occasion, occasion_person, occasion_date,
    customer_note
  ) values (
    'website', p_customer_name, p_phone, p_whatsapp, p_fulfillment, p_delivery_area_id,
    p_address, p_required_date, p_time_slot, p_subtotal, p_delivery_fee, p_late_night_fee,
    p_total, p_payment_method, p_payment_proof_url, p_occasion, p_occasion_person,
    p_occasion_date, p_customer_note
  )
  -- RETURNING reflects the BEFORE-INSERT triggers, so v_order already
  -- carries the generated order_number, the resolved customer_id, and
  -- the authoritative is_first_order / advance_required.
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id, product_id, name_snapshot, size_label, flavor, weight_kg,
      unit_price, qty, cake_message, addons, reference_image_url
    ) values (
      v_order.id,
      nullif(v_item->>'product_id', '')::uuid,
      v_item->>'name_snapshot',
      nullif(v_item->>'size_label', ''),
      nullif(v_item->>'flavor', ''),
      nullif(v_item->>'weight_kg', '')::numeric,
      (v_item->>'unit_price')::numeric,
      (v_item->>'qty')::int,
      nullif(v_item->>'cake_message', ''),
      coalesce(v_item->'addons', '[]'::jsonb),
      nullif(v_item->>'reference_image_url', '')
    );
  end loop;

  insert into public.order_events (order_id, status, note)
  values (v_order.id, 'pending', 'Order placed on the website.');

  return query
    select v_order.id, v_order.order_number, v_order.is_first_order, v_order.advance_required;
end;
$$;

-- Functions are executable by PUBLIC by default. Without this revoke,
-- anyone holding the (public) anon key could call the RPC directly and
-- post an order with a total of their choosing, bypassing the server
-- action that recalculates it.
revoke all on function public.create_website_order(
  text, text, text, text, uuid, text, date, text, numeric, numeric, numeric, numeric,
  text, text, text, text, date, text, jsonb
) from public, anon, authenticated;

grant execute on function public.create_website_order(
  text, text, text, text, uuid, text, date, text, numeric, numeric, numeric, numeric,
  text, text, text, text, date, text, jsonb
) to service_role;
