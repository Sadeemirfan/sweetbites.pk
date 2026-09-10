-- Multi-branch support - Sweet Bites now has three locations (Arifwala,
-- Lahore, Pattoki) sharing one codebase and one Supabase project, each
-- with its own catalogue, reviews, and delivery areas.
--
-- Only Arifwala keeps an admin dashboard (orders, kitchen, expenses,
-- customers) - Lahore and Pattoki are catalogue-only marketing sites
-- that hand every order to WhatsApp, so `orders`, `customers`,
-- `expenses`, and `site_settings` stay exactly as they are, scoped to
-- Arifwala by the admin queries rather than by a column here.
--
-- Existing rows default to 'arifwala' so nothing already live changes
-- branch.

create type public.branch as enum ('arifwala', 'lahore', 'pattoki');

alter table public.categories
  add column branch public.branch not null default 'arifwala';
alter table public.products
  add column branch public.branch not null default 'arifwala';
alter table public.reviews
  add column branch public.branch not null default 'arifwala';
alter table public.delivery_areas
  add column branch public.branch not null default 'arifwala';

create index categories_branch_idx on public.categories (branch);
create index products_branch_idx on public.products (branch);
create index reviews_branch_idx on public.reviews (branch);
create index delivery_areas_branch_idx on public.delivery_areas (branch);

-- categories.slug was globally unique, which breaks the moment Lahore
-- wants its own "birthday-cakes" category. The URL is now
-- /[branch]/gallery/[category], so uniqueness only needs to hold within
-- a branch - same reasoning PLAN.md already applied to products.slug.
alter table public.categories drop constraint categories_slug_key;
alter table public.categories add unique (branch, slug);
