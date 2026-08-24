-- Phase 2 — indexes from PLAN.md §5.
--
-- Two entries in that list are skipped as explicit CREATE INDEX statements
-- because they already exist implicitly: `orders(order_number)` and
-- `customers(phone)` both carry UNIQUE constraints (declared in the tables
-- migration), and Postgres creates a unique index to enforce those
-- automatically. Adding a second, duplicate index on the same column
-- would just cost writes for no read benefit.

create index idx_orders_required_date on public.orders (required_date);
create index idx_orders_status on public.orders (status);
create index idx_orders_phone on public.orders (phone);
create index idx_orders_customer_id on public.orders (customer_id);
create index idx_orders_source on public.orders (source);
create index idx_orders_created_at on public.orders (created_at);

create index idx_order_items_order_id on public.order_items (order_id);

create index idx_expenses_purchased_on on public.expenses (purchased_on);
create index idx_expenses_category_id on public.expenses (category_id);

create index idx_products_category_id on public.products (category_id);
create index idx_products_slug on public.products (slug);

-- Month-day index for the annual occasion reminder query (PLAN.md §13.4:
-- "finds orders whose occasion_date falls on the same month and day as
-- today + 2 days, in any previous year"). PLAN.md offers two options —
-- a generated `occasion_md` column, or a bare expression index. The
-- generated column was chosen: the reminder query becomes a plain
-- `where occasion_md = to_char(current_date + 2, 'MM-DD')`, which is both
-- simpler to read in application code and impossible to accidentally
-- write in a way that fails to match the index (a hand-written expression
-- index only gets used if every query re-states the exact same
-- expression character-for-character, which is an easy footgun).
create index idx_orders_occasion_md on public.orders (occasion_md);
