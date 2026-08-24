-- Phase 2 — helper functions and triggers.

-- ─────────────────────────────────────────────────────────────────
-- is_admin() — used by every RLS policy below. SECURITY DEFINER so it
-- bypasses RLS on `profiles` when it reads it; without that, evaluating
-- the `profiles` table's own RLS policy (which calls is_admin()) would
-- recurse into itself.
-- ─────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────────
-- Order number generator — SB-MMDD-NNNN, a daily sequence reset at
-- midnight Pakistan time (the business operates in Arifwala; resetting
-- on UTC midnight would flip the date mid-afternoon locally). Backed by
-- the internal _order_number_counters table with an atomic UPSERT, which
-- is safe under concurrent inserts without explicit locking.
-- ─────────────────────────────────────────────────────────────────
create or replace function public.generate_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Asia/Karachi')::date;
  v_counter int;
begin
  if new.order_number is not null then
    return new;
  end if;

  insert into public._order_number_counters (day, counter)
  values (v_day, 1)
  on conflict (day) do update set counter = public._order_number_counters.counter + 1
  returning counter into v_counter;

  new.order_number := 'SB-' || to_char(v_day, 'MMDD') || '-' || lpad(v_counter::text, 4, '0');
  return new;
end;
$$;

create trigger trg_01_order_number
  before insert on public.orders
  for each row
  execute function public.generate_order_number();

-- ─────────────────────────────────────────────────────────────────
-- Customer upsert — fires for every order regardless of source, so a
-- manual WhatsApp/walk-in entry builds customer history exactly like a
-- website order. SECURITY DEFINER is required here: `customers` is
-- admin-only under RLS in both directions, but an anonymous website
-- checkout must still be able to create/update its own customer row
-- indirectly through this trigger.
--
-- Sets NEW.customer_id and NEW.is_first_order directly (BEFORE INSERT),
-- so both are correct on the row as it's actually stored — no follow-up
-- UPDATE needed.
-- ─────────────────────────────────────────────────────────────────
create or replace function public.upsert_customer_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer public.customers;
begin
  select * into v_customer from public.customers where phone = new.phone;

  if v_customer.id is null then
    insert into public.customers (
      phone, name, whatsapp, address, area_id,
      first_order_date, last_order_date, total_orders, total_spent
    ) values (
      new.phone, new.customer_name, new.whatsapp, new.address, new.delivery_area_id,
      new.required_date, new.required_date, 1, coalesce(new.total, 0)
    )
    returning * into v_customer;

    new.is_first_order := true;
  else
    update public.customers set
      total_orders = total_orders + 1,
      total_spent = total_spent + coalesce(new.total, 0),
      first_order_date = least(coalesce(first_order_date, new.required_date), new.required_date),
      last_order_date = greatest(coalesce(last_order_date, new.required_date), new.required_date),
      name = coalesce(customers.name, new.customer_name),
      whatsapp = coalesce(customers.whatsapp, new.whatsapp),
      address = coalesce(customers.address, new.address),
      area_id = coalesce(customers.area_id, new.delivery_area_id)
    where id = v_customer.id;

    new.is_first_order := false;
  end if;

  new.customer_id := v_customer.id;
  return new;
end;
$$;

create trigger trg_02_customer_upsert
  before insert on public.orders
  for each row
  execute function public.upsert_customer_on_order();

-- ─────────────────────────────────────────────────────────────────
-- site_settings.updated_at — the one table in §5 whose own column list
-- calls out an `updated_at`, so it's the one place a touch trigger is
-- clearly intended (admin settings changes should stamp themselves).
-- ─────────────────────────────────────────────────────────────────
create or replace function public.touch_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_site_settings_touch
  before update on public.site_settings
  for each row
  execute function public.touch_site_settings_updated_at();
