-- Split expenses into two buckets: the bakery's own spending, and the
-- owner's household spending logged in the same screen for convenience.
--
-- Reports (§13.3) must only ever count the bakery's own money - a home
-- purchase sitting in the same table would otherwise quietly distort the
-- income/expense P&L. `expense_type` is the flag that keeps them apart;
-- getReport() filters on it.
alter table public.expenses
  add column expense_type text not null default 'business'
    check (expense_type in ('business', 'home'));

comment on column public.expenses.expense_type is
  'business = Sweet Bites purchase, counted in reports. home = owner''s household spending, tracked but excluded from the P&L.';
