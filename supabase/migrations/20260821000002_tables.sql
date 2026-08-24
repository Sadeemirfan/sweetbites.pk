-- Phase 2 — core schema. Implements every table in PLAN.md §5 exactly,
-- plus one internal (non-business) table noted below.

-- ADMIN USERS ONLY. Customers never appear here. One row per admin;
-- created by hand in the Supabase dashboard, never through app code.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- NOTE on slug uniqueness: PLAN.md §5 writes both `slug text UNIQUE` and a
-- trailing `UNIQUE (category_id, slug)` on products, which are redundant
-- if taken together (a global unique already implies the composite one).
-- The sitemap's own routing — /gallery/[category]/[product] — only needs
-- the slug to be unique *within* a category, so the composite constraint
-- is the one that matches the app's actual URL design. Implemented that
-- way; a bare global-unique index on slug was dropped as redundant.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  base_price numeric,
  cost_estimate numeric, -- optional, for rough margin
  image_url text,
  images jsonb,
  sizes jsonb, -- [{label:"1 Pound", weight_kg:0.45, price:1800}, ...]
  flavors jsonb,
  lead_time_days int not null default 2,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table public.addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  is_active boolean not null default true
);

create table public.delivery_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee numeric not null default 0, -- inside Arifwala city = 0
  is_inside_city boolean not null default true,
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- CUSTOMERS — no accounts, no login. Keyed by phone, upserted automatically
-- whenever an order is created from any channel (see the trigger in
-- 20260821000004_functions_triggers.sql).
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  whatsapp text,
  address text,
  area_id uuid references public.delivery_areas (id) on delete set null,
  first_order_date date,
  last_order_date date,
  total_orders int not null default 0,
  total_spent numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique, -- SB-0821-0147, filled by trigger
  customer_id uuid references public.customers (id) on delete set null,
  source text not null default 'website'
    check (source in ('website', 'whatsapp', 'facebook', 'instagram', 'tiktok', 'walk_in', 'phone', 'other')),
  customer_name text,
  phone text not null,
  whatsapp text,
  fulfillment text check (fulfillment in ('pickup', 'delivery')),
  delivery_area_id uuid references public.delivery_areas (id) on delete set null,
  address text,
  required_date date not null,
  time_slot text check (time_slot in ('10-1', '1-4', '4-7', '7-10', 'after-10')),
  subtotal numeric,
  delivery_fee numeric not null default 0, -- area fee
  late_night_fee numeric not null default 0, -- applies when time_slot = 'after-10'
  discount numeric not null default 0,
  total numeric,
  is_first_order boolean not null default false,
  advance_required boolean not null default false,
  advance_paid numeric not null default 0,
  payment_method text check (payment_method in ('cod', 'jazzcash', 'easypaisa', 'bank')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'partial', 'paid')),
  payment_proof_url text,
  -- OCCASION — powers the yearly reminder system (PLAN.md §13.4)
  occasion text check (occasion in ('birthday', 'anniversary', 'wedding', 'graduation', 'religious', 'other', 'none')),
  occasion_person text, -- "Ayesha", from the cake message
  occasion_date date, -- the actual event date, usually = required_date
  -- Generated month-day column so the reminder query ("today + 2 days" in
  -- any past year) is a cheap equality lookup instead of re-evaluating
  -- EXTRACT(...) on every row. See the index in 20260821000003_indexes.sql
  -- for why a generated column was chosen over a bare expression index.
  -- Built from EXTRACT/lpad rather than to_char(), which Postgres refuses
  -- in a generated column — to_char() is only STABLE (locale-dependent
  -- output), not IMMUTABLE, which generated expressions require.
  occasion_md text generated always as (
    lpad(extract(month from occasion_date)::text, 2, '0') || '-' ||
    lpad(extract(day from occasion_date)::text, 2, '0')
  ) stored,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'baking', 'ready', 'out_for_delivery', 'completed', 'cancelled')),
  customer_note text,
  admin_note text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name_snapshot text,
  size_label text,
  flavor text,
  weight_kg numeric,
  unit_price numeric,
  qty int not null default 1,
  cake_message text,
  addons jsonb,
  reference_image_url text
);

-- ON DELETE CASCADE on order_id isn't spelled out in PLAN.md for this
-- table (only order_items says it explicitly), but an event log with no
-- order behind it is meaningless, so it follows the same rule.
create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

-- EXPENSES & PURCHASES
create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- Ingredients, Packaging, Fuel, Utilities,
  sort_order int not null default 0, -- Equipment, Delivery, Marketing, Other
  is_active boolean not null default true
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.expense_categories (id) on delete set null,
  item text not null, -- "Flour", "Cream", "Cake boxes"
  vendor text, -- where it came from
  quantity numeric,
  unit text, -- 20, "kg"
  unit_price numeric, -- optional, per unit
  amount numeric not null, -- total paid
  purchased_on date not null,
  payment_method text,
  note text,
  receipt_url text,
  created_at timestamptz not null default now()
);

-- REMINDERS — generated from orders, but dismissible and annotatable
create table public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete cascade,
  reminder_date date not null, -- the date we surface it
  occasion_date date, -- the original anniversary
  status text not null default 'pending'
    check (status in ('pending', 'contacted', 'ordered', 'dismissed')),
  note text,
  created_at timestamptz not null default now(),
  unique (order_id, reminder_date)
);

create table public.custom_cake_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  occasion text,
  tiers int,
  weight_kg numeric,
  flavor text,
  theme_description text,
  reference_images jsonb,
  budget_min numeric,
  budget_max numeric,
  required_date date,
  status text not null default 'new'
    check (status in ('new', 'quoted', 'accepted', 'declined', 'converted')),
  quoted_price numeric,
  admin_reply text,
  created_at timestamptz not null default now()
);

-- No capacity columns anywhere, by design (PLAN.md §8 rule 4)
create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday int not null check (weekday between 0 and 6),
  is_open boolean not null default true
);

create table public.blackout_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  rating int check (rating between 1 and 5),
  body text,
  image_url text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

-- INTERNAL — not part of the business schema in PLAN.md §5. Backs the
-- SB-MMDD-NNNN order number generator with a per-day atomic counter.
-- Locked down completely by RLS (no policies at all); only the
-- SECURITY DEFINER trigger function ever touches it.
create table public._order_number_counters (
  day date primary key,
  counter int not null default 0
);
comment on table public._order_number_counters is
  'Internal counter for generate_order_number(); not a PLAN.md §5 table.';
