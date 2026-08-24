-- ─────────────────────────────────────────────────────────────────
-- Phase 6 seed additions. Run after supabase/seed.sql.
-- ─────────────────────────────────────────────────────────────────

-- Reminder demo row, dated relative to whenever this is run.
--
-- §13.4 surfaces occasions falling exactly two days out, in any
-- previous year. A hardcoded date only demonstrates that on one
-- particular day, so this pins the demo order's occasion to
-- (today + 2 days) one year ago - the reminder then fires no matter
-- when the seed is loaded. occasion_md is a generated column, so it
-- follows automatically.
update public.orders
   set occasion_date = ((current_date + 2) - interval '1 year')::date
 where id = '40000000-0000-4000-8000-000000000000';

-- Idempotent: re-running the seed shouldn't stack duplicate purchases.
delete from public.expenses;

-- EXPENSES - without these the reports screen has only one of its two
-- primary numbers, and the §13.3 caveat about bulk buying distorting
-- short ranges cannot be seen at all.
--
-- Scaled to the seeded order volume (~4 orders a month, ~Rs. 89k of
-- income across the year) so the reports read like a small kitchen that
-- is modestly profitable, not one in freefall.
--
-- Deliberately lumpy: flour, sugar, butter and cream land on a few days
-- and get used over the following weeks, which is exactly the
-- distortion §13.3 warns about - a purchase day looks like a loss, the
-- baking days look inflated. Item names repeat across months so the
-- §13.2 autocomplete has real history to offer.
insert into public.expenses (category_id, item, vendor, quantity, unit, unit_price, amount, purchased_on, payment_method, note) values
  ((select id from public.expense_categories where name = 'Ingredients'), 'Flour', 'Al-Madina Store', 5, 'kg', 95, 475, '2026-03-02', 'cash', 'Monthly bulk'),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Sugar', 'Al-Madina Store', 4, 'kg', 140, 560, '2026-03-02', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Butter', 'Metro Cash and Carry', 2, 'kg', 1250, 2500, '2026-03-03', 'cash', null),
  ((select id from public.expense_categories where name = 'Packaging'), 'Cake boxes', 'Paper House', 20, 'pcs', 45, 900, '2026-03-05', 'cash', '1 and 2 pound sizes'),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Fresh cream', 'Dairy Point', 2, 'litre', 480, 960, '2026-03-18', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Eggs', 'Local shop', 3, 'dozen', 330, 990, '2026-03-18', 'cash', null),
  ((select id from public.expense_categories where name = 'Fuel'), 'Petrol', 'PSO Pump', 4, 'litre', 268, 1072, '2026-03-20', 'cash', 'Deliveries'),

  ((select id from public.expense_categories where name = 'Ingredients'), 'Flour', 'Al-Madina Store', 5, 'kg', 95, 475, '2026-04-04', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Chocolate compound', 'Metro Cash and Carry', 2, 'kg', 1150, 2300, '2026-04-04', 'bank', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Fresh cream', 'Dairy Point', 2, 'litre', 480, 960, '2026-04-12', 'cash', null),
  ((select id from public.expense_categories where name = 'Utilities'), 'Electricity bill', 'FESCO', null, null, null, 2400, '2026-04-14', 'bank', null),
  ((select id from public.expense_categories where name = 'Packaging'), 'Cake boards', 'Paper House', 15, 'pcs', 60, 900, '2026-04-20', 'cash', null),
  ((select id from public.expense_categories where name = 'Fuel'), 'Petrol', 'PSO Pump', 4, 'litre', 268, 1072, '2026-04-22', 'cash', null),

  ((select id from public.expense_categories where name = 'Ingredients'), 'Flour', 'Al-Madina Store', 5, 'kg', 98, 490, '2026-05-02', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Sugar', 'Al-Madina Store', 4, 'kg', 145, 580, '2026-05-02', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Butter', 'Metro Cash and Carry', 2, 'kg', 1290, 2580, '2026-05-03', 'bank', null),
  ((select id from public.expense_categories where name = 'Equipment'), 'Piping nozzle set', 'Baker Supplies', 1, 'set', 1400, 1400, '2026-05-10', 'easypaisa', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Fresh cream', 'Dairy Point', 3, 'litre', 490, 1470, '2026-05-15', 'cash', null),
  ((select id from public.expense_categories where name = 'Utilities'), 'Gas bill', 'SNGPL', null, null, null, 1150, '2026-05-16', 'bank', null),
  ((select id from public.expense_categories where name = 'Delivery'), 'Rider payment', 'Imran', null, null, null, 1500, '2026-05-28', 'cash', 'Weekly'),

  ((select id from public.expense_categories where name = 'Ingredients'), 'Flour', 'Al-Madina Store', 5, 'kg', 98, 490, '2026-06-03', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Eggs', 'Local shop', 3, 'dozen', 340, 1020, '2026-06-06', 'cash', null),
  ((select id from public.expense_categories where name = 'Packaging'), 'Cake boxes', 'Paper House', 20, 'pcs', 47, 940, '2026-06-08', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Fresh cream', 'Dairy Point', 2, 'litre', 495, 990, '2026-06-14', 'cash', null),
  ((select id from public.expense_categories where name = 'Marketing'), 'Facebook page boost', 'Meta', null, null, null, 900, '2026-06-18', 'bank', 'Eid campaign'),
  ((select id from public.expense_categories where name = 'Utilities'), 'Electricity bill', 'FESCO', null, null, null, 2650, '2026-06-20', 'bank', null),
  ((select id from public.expense_categories where name = 'Fuel'), 'Petrol', 'PSO Pump', 4, 'litre', 272, 1088, '2026-06-25', 'cash', null),

  ((select id from public.expense_categories where name = 'Ingredients'), 'Flour', 'Al-Madina Store', 5, 'kg', 100, 500, '2026-07-02', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Sugar', 'Al-Madina Store', 4, 'kg', 148, 592, '2026-07-02', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Butter', 'Metro Cash and Carry', 2, 'kg', 1310, 2620, '2026-07-05', 'bank', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Fresh cream', 'Dairy Point', 3, 'litre', 500, 1500, '2026-07-12', 'cash', null),
  ((select id from public.expense_categories where name = 'Packaging'), 'Ribbons and toppers', 'Paper House', null, null, null, 650, '2026-07-14', 'cash', null),
  ((select id from public.expense_categories where name = 'Delivery'), 'Rider payment', 'Imran', null, null, null, 1500, '2026-07-20', 'cash', null),
  ((select id from public.expense_categories where name = 'Fuel'), 'Petrol', 'PSO Pump', 4, 'litre', 275, 1100, '2026-07-26', 'cash', null),

  ((select id from public.expense_categories where name = 'Ingredients'), 'Flour', 'Al-Madina Store', 5, 'kg', 100, 500, '2026-08-03', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Fresh cream', 'Dairy Point', 2, 'litre', 505, 1010, '2026-08-05', 'cash', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Eggs', 'Local shop', 2, 'dozen', 345, 690, '2026-08-08', 'cash', null),
  ((select id from public.expense_categories where name = 'Packaging'), 'Cake boxes', 'Paper House', 20, 'pcs', 48, 960, '2026-08-11', 'cash', null),
  ((select id from public.expense_categories where name = 'Utilities'), 'Electricity bill', 'FESCO', null, null, null, 2800, '2026-08-14', 'bank', null),
  ((select id from public.expense_categories where name = 'Ingredients'), 'Chocolate compound', 'Metro Cash and Carry', 2, 'kg', 1180, 2360, '2026-08-18', 'bank', null),
  ((select id from public.expense_categories where name = 'Fuel'), 'Petrol', 'PSO Pump', 3, 'litre', 278, 834, '2026-08-20', 'cash', null);
