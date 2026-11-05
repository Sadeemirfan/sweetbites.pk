-- Migration: 20260826000001_add_updated_at_to_products_and_categories.sql
-- Description: Add updated_at columns and update triggers to products and categories tables

-- 1. Add updated_at to products
alter table public.products
  add column if not exists updated_at timestamptz not null default now();

-- Backfill updated_at to match created_at for existing rows
update public.products
set updated_at = created_at
where updated_at is distinct from created_at;

-- 2. Add updated_at to categories
alter table public.categories
  add column if not exists updated_at timestamptz not null default now();

-- Backfill updated_at to match created_at for existing rows
update public.categories
set updated_at = created_at
where updated_at is distinct from created_at;

-- 3. Touch updated_at trigger function
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 4. Triggers for products and categories
drop trigger if exists touch_products_updated_at on public.products;
create trigger touch_products_updated_at
  before update on public.products
  for each row
  execute function public.touch_updated_at();

drop trigger if exists touch_categories_updated_at on public.categories;
create trigger touch_categories_updated_at
  before update on public.categories
  for each row
  execute function public.touch_updated_at();
