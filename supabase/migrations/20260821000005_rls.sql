-- Phase 2 — Row Level Security. Implements the matrix in PLAN.md §5
-- exactly. Anonymous users can INSERT orders, order_items, order_events,
-- reviews, and custom_cake_requests, but can SELECT none of them back —
-- there is no customer-facing read path for order data at all.
--
-- Every "public where is_active/is_approved" read policy is written as
-- `<flag> = true or public.is_admin()`, so the admin dashboard can also
-- see inactive/unapproved rows it needs to manage. That's strictly more
-- access for admin, not a change to what the public can see.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addons enable row level security;
alter table public.delivery_areas enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.reminder_log enable row level security;
alter table public.custom_cake_requests enable row level security;
alter table public.availability_rules enable row level security;
alter table public.blackout_dates enable row level security;
alter table public.reviews enable row level security;
alter table public.site_settings enable row level security;
-- Internal table: RLS enabled, zero policies — fully locked to normal
-- roles. Only the SECURITY DEFINER order-number trigger touches it.
alter table public._order_number_counters enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- categories, products, addons, delivery_areas
-- Read: public where is_active · Write: admin only
-- ─────────────────────────────────────────────────────────────────
create policy "categories_read" on public.categories
  for select using (is_active = true or public.is_admin());
create policy "categories_insert" on public.categories
  for insert with check (public.is_admin());
create policy "categories_update" on public.categories
  for update using (public.is_admin()) with check (public.is_admin());
create policy "categories_delete" on public.categories
  for delete using (public.is_admin());

create policy "products_read" on public.products
  for select using (is_active = true or public.is_admin());
create policy "products_insert" on public.products
  for insert with check (public.is_admin());
create policy "products_update" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "products_delete" on public.products
  for delete using (public.is_admin());

create policy "addons_read" on public.addons
  for select using (is_active = true or public.is_admin());
create policy "addons_insert" on public.addons
  for insert with check (public.is_admin());
create policy "addons_update" on public.addons
  for update using (public.is_admin()) with check (public.is_admin());
create policy "addons_delete" on public.addons
  for delete using (public.is_admin());

create policy "delivery_areas_read" on public.delivery_areas
  for select using (is_active = true or public.is_admin());
create policy "delivery_areas_insert" on public.delivery_areas
  for insert with check (public.is_admin());
create policy "delivery_areas_update" on public.delivery_areas
  for update using (public.is_admin()) with check (public.is_admin());
create policy "delivery_areas_delete" on public.delivery_areas
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- reviews — Read: public where is_approved · Write: INSERT anyone,
-- UPDATE/DELETE admin
-- ─────────────────────────────────────────────────────────────────
create policy "reviews_read" on public.reviews
  for select using (is_approved = true or public.is_admin());
create policy "reviews_insert" on public.reviews
  for insert with check (true);
create policy "reviews_update" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());
create policy "reviews_delete" on public.reviews
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- orders, order_items, order_events — Read: admin only · Write: INSERT
-- anyone (a website checkout needs to write all three anonymously in one
-- transaction), UPDATE/DELETE admin.
-- ─────────────────────────────────────────────────────────────────
create policy "orders_read" on public.orders
  for select using (public.is_admin());
create policy "orders_insert" on public.orders
  for insert with check (true);
create policy "orders_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
create policy "orders_delete" on public.orders
  for delete using (public.is_admin());

create policy "order_items_read" on public.order_items
  for select using (public.is_admin());
create policy "order_items_insert" on public.order_items
  for insert with check (true);
create policy "order_items_update" on public.order_items
  for update using (public.is_admin()) with check (public.is_admin());
create policy "order_items_delete" on public.order_items
  for delete using (public.is_admin());

create policy "order_events_read" on public.order_events
  for select using (public.is_admin());
create policy "order_events_insert" on public.order_events
  for insert with check (true);
create policy "order_events_update" on public.order_events
  for update using (public.is_admin()) with check (public.is_admin());
create policy "order_events_delete" on public.order_events
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- customers, expenses, expense_categories, reminder_log — admin only in
-- BOTH directions. None of this is ever publicly readable or writable.
-- (customers is still populated for anonymous checkouts — that happens
-- via the SECURITY DEFINER trigger, which bypasses RLS entirely, not
-- through these policies.)
-- ─────────────────────────────────────────────────────────────────
create policy "customers_all" on public.customers
  for all using (public.is_admin()) with check (public.is_admin());

create policy "expenses_all" on public.expenses
  for all using (public.is_admin()) with check (public.is_admin());

create policy "expense_categories_all" on public.expense_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reminder_log_all" on public.reminder_log
  for all using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- custom_cake_requests — Read: admin only · Write: INSERT anyone,
-- UPDATE admin. PLAN.md §5's RLS table lists only UPDATE (not DELETE)
-- for admin here, unlike every other admin-write row which spells out
-- "UPDATE/DELETE admin" — taken literally, so there's deliberately no
-- DELETE policy; removing a request needs the service-role key.
-- ─────────────────────────────────────────────────────────────────
create policy "custom_cake_requests_read" on public.custom_cake_requests
  for select using (public.is_admin());
create policy "custom_cake_requests_insert" on public.custom_cake_requests
  for insert with check (true);
create policy "custom_cake_requests_update" on public.custom_cake_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- availability_rules, blackout_dates, site_settings — Read: public ·
-- Write: admin
-- ─────────────────────────────────────────────────────────────────
create policy "availability_rules_read" on public.availability_rules
  for select using (true);
create policy "availability_rules_insert" on public.availability_rules
  for insert with check (public.is_admin());
create policy "availability_rules_update" on public.availability_rules
  for update using (public.is_admin()) with check (public.is_admin());
create policy "availability_rules_delete" on public.availability_rules
  for delete using (public.is_admin());

create policy "blackout_dates_read" on public.blackout_dates
  for select using (true);
create policy "blackout_dates_insert" on public.blackout_dates
  for insert with check (public.is_admin());
create policy "blackout_dates_update" on public.blackout_dates
  for update using (public.is_admin()) with check (public.is_admin());
create policy "blackout_dates_delete" on public.blackout_dates
  for delete using (public.is_admin());

create policy "site_settings_read" on public.site_settings
  for select using (true);
create policy "site_settings_insert" on public.site_settings
  for insert with check (public.is_admin());
create policy "site_settings_update" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());
create policy "site_settings_delete" on public.site_settings
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- profiles — Read: own row or admin · Write: admin
-- ─────────────────────────────────────────────────────────────────
create policy "profiles_read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_insert" on public.profiles
  for insert with check (public.is_admin());
create policy "profiles_update" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
create policy "profiles_delete" on public.profiles
  for delete using (public.is_admin());
