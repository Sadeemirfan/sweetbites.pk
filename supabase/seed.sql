-- Phase 2 - seed data. Run after all migrations. Uses `supabase db reset`
-- convention: this file lives at supabase/seed.sql (not in migrations/)
-- so it can be re-run independently of schema changes.
--
-- Products/categories/delivery_areas/expense_categories keep their
-- server-generated UUIDs and are cross-referenced by slug/name via
-- subquery, which keeps this file readable. Orders are the one exception
-- - they're given literal ids so order_items/order_events can reference
-- them directly without a RETURNING/CTE chain for every single row.

-- ─────────────────────────────────────────────────────────────────
-- Categories (5)
-- ─────────────────────────────────────────────────────────────────
insert into public.categories (name, slug, description, sort_order, is_active) values
  ('Birthday Cakes', 'birthday-cakes', 'Classic and fun birthday cakes, baked fresh to order.', 1, true),
  ('Wedding & Tiered Cakes', 'wedding-tiered-cakes', 'Multi-tier cakes for weddings, engagements, and walimas.', 2, true),
  ('Cupcakes', 'cupcakes', 'Boxes of 6 or 12, mix and match flavours.', 3, true),
  ('Fondant & Theme Cakes', 'fondant-theme-cakes', 'Character, sports, and custom theme cakes in fondant.', 4, true),
  ('Cheesecakes & Fusion Desserts', 'cheesecakes-fusion', 'Baked cheesecakes and fusion cream cakes.', 5, true);

-- ─────────────────────────────────────────────────────────────────
-- Products (15) - pound sizes and PKR prices, 8 flavours distributed
-- across them. Flavours used: Chocolate Fudge, Vanilla, Red Velvet,
-- Black Forest, Butterscotch, Pineapple, Coffee Walnut, Fresh Fruit.
-- ─────────────────────────────────────────────────────────────────

-- Birthday Cakes
insert into public.products (category_id, name, slug, description, base_price, cost_estimate, sizes, flavors, lead_time_days, is_featured) values
  ((select id from public.categories where slug = 'birthday-cakes'),
   'Classic Chocolate Birthday Cake', 'classic-chocolate',
   'Our most-ordered birthday cake - rich chocolate sponge, silky buttercream.',
   1800, 950,
   '[{"label":"1 Pound","weight_kg":0.45,"price":1800},{"label":"2 Pound","weight_kg":0.9,"price":3600},{"label":"3 Pound","weight_kg":1.35,"price":5200},{"label":"4 Pound","weight_kg":1.8,"price":6800}]',
   '["Chocolate Fudge","Vanilla","Red Velvet"]', 2, true),
  ((select id from public.categories where slug = 'birthday-cakes'),
   'Rainbow Sprinkle Cake', 'rainbow-sprinkle',
   'Bright, festive, loaded with sprinkles - a kids'' favourite.',
   1900, null,
   '[{"label":"1 Pound","weight_kg":0.45,"price":1900},{"label":"2 Pound","weight_kg":0.9,"price":3700},{"label":"3 Pound","weight_kg":1.35,"price":5400}]',
   '["Vanilla","Butterscotch"]', 2, false),
  ((select id from public.categories where slug = 'birthday-cakes'),
   'Number & Alphabet Cake', 'number-alphabet',
   'Shaped as a number or letter - tell us which when you order.',
   2200, 1150,
   '[{"label":"1 Pound","weight_kg":0.45,"price":2200},{"label":"2 Pound","weight_kg":0.9,"price":4200}]',
   '["Chocolate Fudge","Vanilla","Red Velvet","Butterscotch"]', 3, true);

-- Wedding & Tiered Cakes
insert into public.products (category_id, name, slug, description, base_price, cost_estimate, sizes, flavors, lead_time_days, is_featured) values
  ((select id from public.categories where slug = 'wedding-tiered-cakes'),
   'Two-Tier Wedding Cake', 'two-tier-wedding',
   'A two-tier centrepiece for engagements and smaller walimas.',
   8800, 4600,
   '[{"label":"5 Pound (2-tier)","weight_kg":2.25,"price":8800},{"label":"8 Pound (2-tier)","weight_kg":3.6,"price":13500}]',
   '["Vanilla","Red Velvet","Black Forest"]', 3, true),
  ((select id from public.categories where slug = 'wedding-tiered-cakes'),
   'Three-Tier Wedding Cake', 'three-tier-wedding',
   'The full statement cake for a wedding or walima stage table.',
   16500, null,
   '[{"label":"10 Pound (3-tier)","weight_kg":4.5,"price":16500},{"label":"15 Pound (3-tier)","weight_kg":6.75,"price":23500}]',
   '["Vanilla","Red Velvet","Black Forest","Coffee Walnut"]', 3, false),
  ((select id from public.categories where slug = 'wedding-tiered-cakes'),
   'Engagement Ring Cake', 'engagement-ring',
   'Ring-shaped novelty cake for engagement ceremonies.',
   4500, null,
   '[{"label":"3 Pound","weight_kg":1.35,"price":4500},{"label":"4 Pound","weight_kg":1.8,"price":5800}]',
   '["Chocolate Fudge","Vanilla"]', 3, false);

-- Cupcakes
insert into public.products (category_id, name, slug, description, base_price, cost_estimate, sizes, flavors, lead_time_days, is_featured) values
  ((select id from public.categories where slug = 'cupcakes'),
   'Chocolate Cupcakes', 'chocolate-cupcakes-6',
   'Six rich chocolate cupcakes with chocolate buttercream swirl.',
   1200, 650,
   '[{"label":"Box of 6","weight_kg":null,"price":1200},{"label":"Box of 12","weight_kg":null,"price":2200}]',
   '["Chocolate Fudge"]', 2, false),
  ((select id from public.categories where slug = 'cupcakes'),
   'Assorted Cupcakes', 'assorted-cupcakes-12',
   'Mix of four flavours, a dozen cupcakes, great for small parties.',
   2200, 1150,
   '[{"label":"Box of 12","weight_kg":null,"price":2200}]',
   '["Chocolate Fudge","Vanilla","Red Velvet","Butterscotch"]', 2, true),
  ((select id from public.categories where slug = 'cupcakes'),
   'Red Velvet Cupcakes', 'red-velvet-cupcakes-6',
   'Six red velvet cupcakes with cream cheese frosting.',
   1400, null,
   '[{"label":"Box of 6","weight_kg":null,"price":1400},{"label":"Box of 12","weight_kg":null,"price":2600}]',
   '["Red Velvet"]', 2, false);

-- Fondant & Theme Cakes
insert into public.products (category_id, name, slug, description, base_price, cost_estimate, sizes, flavors, lead_time_days, is_featured) values
  ((select id from public.categories where slug = 'fondant-theme-cakes'),
   'Cartoon Character Cake', 'cartoon-character',
   'Hand-modelled fondant character cake - send a reference picture.',
   3800, 2000,
   '[{"label":"2 Pound","weight_kg":0.9,"price":3800},{"label":"3 Pound","weight_kg":1.35,"price":5400}]',
   '["Chocolate Fudge","Vanilla","Butterscotch"]', 3, true),
  ((select id from public.categories where slug = 'fondant-theme-cakes'),
   'Football / Sports Theme Cake', 'sports-theme',
   'Pitch, jersey, or ball design - any team colours.',
   3600, null,
   '[{"label":"2 Pound","weight_kg":0.9,"price":3600},{"label":"3 Pound","weight_kg":1.35,"price":5200}]',
   '["Chocolate Fudge","Vanilla"]', 3, false),
  ((select id from public.categories where slug = 'fondant-theme-cakes'),
   'Floral Fondant Cake', 'floral-fondant',
   'Hand-piped sugar flowers over a smooth fondant finish.',
   4200, 2250,
   '[{"label":"2 Pound","weight_kg":0.9,"price":4200},{"label":"3 Pound","weight_kg":1.35,"price":6000}]',
   '["Vanilla","Red Velvet","Pineapple"]', 3, false);

-- Cheesecakes & Fusion Desserts
insert into public.products (category_id, name, slug, description, base_price, cost_estimate, sizes, flavors, lead_time_days, is_featured) values
  ((select id from public.categories where slug = 'cheesecakes-fusion'),
   'Classic Baked Cheesecake', 'classic-baked-cheesecake',
   'Dense, creamy, baked New York-style cheesecake.',
   2400, 1300,
   '[{"label":"1.5 Pound","weight_kg":0.68,"price":2400},{"label":"2.5 Pound","weight_kg":1.1,"price":3800}]',
   '["Vanilla","Fresh Fruit"]', 2, false),
  ((select id from public.categories where slug = 'cheesecakes-fusion'),
   'Nutella Fusion Cake', 'nutella-fusion',
   'Chocolate sponge, Nutella cream, hazelnut crunch.',
   2800, null,
   '[{"label":"1 Pound","weight_kg":0.45,"price":2800},{"label":"2 Pound","weight_kg":0.9,"price":5200}]',
   '["Chocolate Fudge","Coffee Walnut"]', 2, true),
  ((select id from public.categories where slug = 'cheesecakes-fusion'),
   'Mango Fresh Cream Cake', 'mango-fresh-cream',
   'Seasonal favourite - fresh mango layered with light cream.',
   2600, 1400,
   '[{"label":"1 Pound","weight_kg":0.45,"price":2600},{"label":"2 Pound","weight_kg":0.9,"price":4800}]',
   '["Pineapple","Fresh Fruit"]', 2, false);

-- ─────────────────────────────────────────────────────────────────
-- Delivery areas (6) - 4 inside Arifwala at fee 0, 2 outlying villages
-- ─────────────────────────────────────────────────────────────────
insert into public.delivery_areas (name, fee, is_inside_city, sort_order) values
  ('Arifwala City Center', 0, true, 1),
  ('Gulshan-e-Wahab', 0, true, 2),
  ('Chak 3/BC', 0, true, 3),
  ('Jhandeer Road', 0, true, 4),
  ('Chak 96/9-L', 300, false, 5),
  ('Haveli Lakha Road villages', 500, false, 6);

-- ─────────────────────────────────────────────────────────────────
-- Expense categories (8) - exact names from PLAN.md §13.2
-- ─────────────────────────────────────────────────────────────────
insert into public.expense_categories (name, sort_order) values
  ('Ingredients', 1),
  ('Packaging', 2),
  ('Fuel', 3),
  ('Utilities', 4),
  ('Equipment', 5),
  ('Delivery', 6),
  ('Marketing', 7),
  ('Other', 8);

-- ─────────────────────────────────────────────────────────────────
-- Reviews (5, approved)
-- ─────────────────────────────────────────────────────────────────
insert into public.reviews (customer_name, rating, body, is_approved, created_at) values
  ('Ayesha Malik', 5, 'Best chocolate cake in Arifwala, hands down. Ordered for my daughter''s birthday and everyone asked where it was from.', true, now() - interval '145 days'),
  ('Usman Tariq', 5, 'The two-tier cake for our engagement was better than the pictures we sent. Very professional and on time.', true, now() - interval '110 days'),
  ('Sadia Yousaf', 4, 'Great taste, less sweet than bakery cakes which we liked. Delivery was a bit late but they called ahead to let us know.', true, now() - interval '80 days'),
  ('Imran Sheikh', 5, 'Ordered the football theme cake for my son. He loved it. Will definitely order again.', true, now() - interval '40 days'),
  ('Rabia Hussain', 5, 'Fresh, homemade taste - you can tell it''s not from a display case. The red velvet cupcakes were amazing.', true, now() - interval '12 days');

-- ─────────────────────────────────────────────────────────────────
-- Site settings - defaults for §12 /admin/settings
-- ─────────────────────────────────────────────────────────────────
insert into public.site_settings (key, value) values
  ('headline_text', '"Arifwala''s own homemade cake studio"'),
  ('whatsapp_number', '"923217337801"'),
  ('business_hours', '{"open":"08:00","close":"22:00","days":"all"}'),
  ('social_links', '{"instagram":"https://instagram.com/sweetbitesarifwala","facebook":"https://facebook.com/SweetBitesArifwala","tiktok":"https://tiktok.com/@sweetbitesarifwala","threads":"https://threads.com/@sweetbitesarifwala"}'),
  ('announcement_bar', '{"enabled":false,"text":""}'),
  ('late_night_fee', '200'),
  ('payment_details', '{"jazzcash":{"number":"03217337801","name":"Sweet Bites Arifwala"},"easypaisa":{"number":"03217337801","name":"Sweet Bites Arifwala"},"bank":{"bank_name":"Meezan Bank","account_title":"Sweet Bites Arifwala","account_number":"01234567890123","iban":"PK00MEZN0001234567890123"}}');

-- ─────────────────────────────────────────────────────────────────
-- Orders (~20) spread across the last 6 months, mixed sources and
-- occasion dates, plus one deliberately dated over a year back so the
-- annual reminder query (PLAN.md §13.4) has something to actually match
-- against "today + 2 days" during Phase 6 - this mirrors the plan's own
-- worked example (Ayesha's birthday, 2 Pound Chocolate Fudge, Rs 3,600).
--
-- Orders are inserted oldest-first so the customer upsert trigger builds
-- realistic total_orders/total_spent/first_order_date history.
-- customer_id and is_first_order are left off every INSERT - the
-- trigger fills both in.
-- ─────────────────────────────────────────────────────────────────

-- Reminder demo row - over a year old on purpose
insert into public.orders (id, source, customer_name, phone, whatsapp, fulfillment, delivery_area_id, required_date, time_slot, subtotal, delivery_fee, total, payment_method, payment_status, occasion, occasion_person, occasion_date, status, created_at) values
  ('40000000-0000-4000-8000-000000000000', 'whatsapp', 'Fatima Bibi', '03001234501', '03001234501', 'delivery', (select id from public.delivery_areas where name = 'Gulshan-e-Wahab'), '2025-08-23', '10-1', 3600, 0, 3600, 'cod', 'paid', 'birthday', 'Ayesha', '2025-08-23', 'completed', '2025-08-15 10:00:00+05');
insert into public.order_items (order_id, product_id, name_snapshot, size_label, flavor, unit_price, qty) values
  ('40000000-0000-4000-8000-000000000000', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Chocolate Fudge', 3600, 1);
insert into public.order_events (order_id, status, note, created_at) values
  ('40000000-0000-4000-8000-000000000000', 'completed', 'Seed data - historical order for reminder demo.', '2025-08-15 10:00:00+05');

-- The last-6-months batch
insert into public.orders (id, source, customer_name, phone, whatsapp, fulfillment, delivery_area_id, required_date, time_slot, subtotal, delivery_fee, late_night_fee, total, payment_method, payment_status, advance_required, advance_paid, occasion, occasion_person, occasion_date, status, created_at) values
  ('40000000-0000-4000-8000-000000000001', 'website', 'Sana Tariq', '03011234502', '03011234502', 'delivery', (select id from public.delivery_areas where name = 'Gulshan-e-Wahab'), '2026-03-05', '1-4', 3600, 0, 0, 3600, 'jazzcash', 'paid', true, 3600, 'none', null, null, 'completed', '2026-03-02 11:20:00+05'),
  ('40000000-0000-4000-8000-000000000002', 'walk_in', 'Bilal Ahmed', '03021234503', null, 'pickup', null, '2026-03-12', '10-1', 1800, 0, 0, 1800, 'cod', 'paid', false, 0, 'none', null, null, 'completed', '2026-03-10 09:15:00+05'),
  ('40000000-0000-4000-8000-000000000003', 'facebook', 'Ayesha Noor', '03031234504', '03031234504', 'delivery', (select id from public.delivery_areas where name = 'Chak 96/9-L'), '2026-03-21', '4-7', 3600, 300, 0, 3900, 'cod', 'paid', true, 3900, 'birthday', 'Zara', '2026-03-21', 'completed', '2026-03-18 14:40:00+05'),
  ('40000000-0000-4000-8000-000000000004', 'instagram', 'Hassan Raza', '03041234505', '03041234505', 'pickup', null, '2026-03-30', '1-4', 5200, 0, 0, 5200, 'easypaisa', 'paid', true, 5200, 'none', null, null, 'completed', '2026-03-27 16:05:00+05'),
  ('40000000-0000-4000-8000-000000000005', 'whatsapp', 'Sana Tariq', '03011234502', '03011234502', 'delivery', (select id from public.delivery_areas where name = 'Arifwala City Center'), '2026-04-08', '10-1', 3600, 0, 0, 3600, 'cod', 'paid', false, 0, 'anniversary', null, '2026-04-08', 'completed', '2026-04-04 10:30:00+05'),
  ('40000000-0000-4000-8000-000000000006', 'website', 'Mehwish Iqbal', '03051234506', '03051234506', 'delivery', (select id from public.delivery_areas where name = 'Jhandeer Road'), '2026-04-15', '4-7', 6800, 0, 0, 6800, 'easypaisa', 'paid', true, 6800, 'none', null, null, 'completed', '2026-04-12 12:50:00+05'),
  ('40000000-0000-4000-8000-000000000007', 'tiktok', 'Usman Khalid', '03061234507', '03061234507', 'pickup', null, '2026-04-24', '1-4', 1800, 0, 0, 1800, 'cod', 'unpaid', false, 0, 'none', null, null, 'cancelled', '2026-04-20 15:10:00+05'),
  ('40000000-0000-4000-8000-000000000008', 'walk_in', 'Bilal Ahmed', '03021234503', null, 'pickup', null, '2026-05-01', '10-1', 8800, 0, 0, 8800, 'bank', 'paid', false, 0, 'wedding', null, '2026-05-01', 'completed', '2026-04-28 09:45:00+05'),
  ('40000000-0000-4000-8000-000000000009', 'phone', 'Nimra Sheikh', '03071234508', '03071234508', 'delivery', (select id from public.delivery_areas where name = 'Haveli Lakha Road villages'), '2026-05-09', '1-4', 3600, 500, 0, 4100, 'cod', 'paid', true, 4100, 'none', null, null, 'completed', '2026-05-05 11:00:00+05'),
  ('40000000-0000-4000-8000-000000000010', 'instagram', 'Hassan Raza', '03041234505', '03041234505', 'pickup', null, '2026-05-18', '4-7', 5200, 0, 0, 5200, 'jazzcash', 'paid', false, 0, 'graduation', null, '2026-05-18', 'completed', '2026-05-14 13:25:00+05'),
  ('40000000-0000-4000-8000-000000000011', 'website', 'Ali Hamza', '03081234509', '03081234509', 'pickup', null, '2026-05-25', '10-1', 2200, 0, 0, 2200, 'jazzcash', 'paid', true, 2200, 'none', null, null, 'completed', '2026-05-22 10:15:00+05'),
  ('40000000-0000-4000-8000-000000000012', 'whatsapp', 'Sana Tariq', '03011234502', '03011234502', 'delivery', (select id from public.delivery_areas where name = 'Gulshan-e-Wahab'), '2026-06-03', '1-4', 3600, 0, 0, 3600, 'cod', 'paid', false, 0, 'none', null, null, 'completed', '2026-05-30 09:50:00+05'),
  ('40000000-0000-4000-8000-000000000013', 'facebook', 'Kiran Fatima', '03091234510', '03091234510', 'delivery', (select id from public.delivery_areas where name = 'Gulshan-e-Wahab'), '2026-06-10', '4-7', 3600, 0, 0, 3600, 'cod', 'paid', true, 3600, 'birthday', 'Hamza', '2026-06-10', 'completed', '2026-06-07 14:20:00+05'),
  ('40000000-0000-4000-8000-000000000014', 'website', 'Mehwish Iqbal', '03051234506', '03051234506', 'delivery', (select id from public.delivery_areas where name = 'Jhandeer Road'), '2026-06-19', '1-4', 6800, 0, 0, 6800, 'easypaisa', 'partial', false, 3000, 'none', null, null, 'confirmed', '2026-06-15 11:35:00+05'),
  ('40000000-0000-4000-8000-000000000015', 'walk_in', 'Zainab Aslam', '03101234511', null, 'pickup', null, '2026-06-25', '10-1', 1800, 0, 0, 1800, 'cod', 'paid', true, 1800, 'none', null, null, 'completed', '2026-06-23 09:05:00+05'),
  ('40000000-0000-4000-8000-000000000016', 'instagram', 'Hassan Raza', '03041234505', '03041234505', 'pickup', null, '2026-07-05', '4-7', 5200, 0, 0, 5200, 'jazzcash', 'paid', false, 0, 'none', null, null, 'completed', '2026-07-01 15:40:00+05'),
  ('40000000-0000-4000-8000-000000000017', 'whatsapp', 'Farhan Malik', '03111234512', '03111234512', 'delivery', (select id from public.delivery_areas where name = 'Chak 3/BC'), '2026-07-13', 'after-10', 3600, 0, 200, 3800, 'cod', 'paid', true, 3800, 'religious', null, '2026-07-13', 'completed', '2026-07-09 18:00:00+05'),
  ('40000000-0000-4000-8000-000000000018', 'website', 'Ali Hamza', '03081234509', '03081234509', 'pickup', null, '2026-07-22', '1-4', 2200, 0, 0, 2200, 'jazzcash', 'paid', false, 0, 'none', null, null, 'completed', '2026-07-18 10:10:00+05'),
  ('40000000-0000-4000-8000-000000000019', 'whatsapp', 'Sana Tariq', '03011234502', '03011234502', 'delivery', (select id from public.delivery_areas where name = 'Gulshan-e-Wahab'), '2026-07-30', '10-1', 3600, 0, 0, 3600, 'cod', 'paid', false, 0, 'none', null, null, 'completed', '2026-07-26 09:30:00+05'),
  ('40000000-0000-4000-8000-000000000020', 'phone', 'Nimra Sheikh', '03071234508', '03071234508', 'delivery', (select id from public.delivery_areas where name = 'Haveli Lakha Road villages'), '2026-08-07', '1-4', 3600, 500, 0, 4100, 'cod', 'partial', false, 2000, 'none', null, null, 'baking', '2026-08-03 12:00:00+05'),
  ('40000000-0000-4000-8000-000000000021', 'facebook', 'Kiran Fatima', '03091234510', '03091234510', 'delivery', (select id from public.delivery_areas where name = 'Gulshan-e-Wahab'), '2026-08-14', '4-7', 3600, 0, 0, 3600, 'cod', 'paid', false, 0, 'none', null, null, 'ready', '2026-08-11 13:15:00+05'),
  ('40000000-0000-4000-8000-000000000022', 'walk_in', 'Zainab Aslam', '03101234511', null, 'pickup', null, '2026-08-20', '10-1', 1800, 0, 0, 1800, 'cod', 'unpaid', false, 0, 'other', null, '2026-08-20', 'confirmed', '2026-08-18 10:50:00+05'),
  ('40000000-0000-4000-8000-000000000023', 'website', 'Waleed Sarwar', '03121234513', '03121234513', 'delivery', (select id from public.delivery_areas where name = 'Arifwala City Center'), '2026-08-24', '1-4', 3600, 0, 0, 3600, 'jazzcash', 'unpaid', true, 0, 'none', null, null, 'pending', '2026-08-20 17:30:00+05');

insert into public.order_items (order_id, product_id, name_snapshot, size_label, flavor, unit_price, qty) values
  ('40000000-0000-4000-8000-000000000001', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Red Velvet', 3600, 1),
  ('40000000-0000-4000-8000-000000000002', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '1 Pound', 'Vanilla', 1800, 1),
  ('40000000-0000-4000-8000-000000000003', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Chocolate Fudge', 3600, 1),
  ('40000000-0000-4000-8000-000000000004', (select id from public.products where slug = 'sports-theme'), 'Football / Sports Theme Cake', '3 Pound', 'Chocolate Fudge', 5200, 1),
  ('40000000-0000-4000-8000-000000000005', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Vanilla', 3600, 1),
  ('40000000-0000-4000-8000-000000000006', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '4 Pound', 'Chocolate Fudge', 6800, 1),
  ('40000000-0000-4000-8000-000000000007', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '1 Pound', 'Vanilla', 1800, 1),
  ('40000000-0000-4000-8000-000000000008', (select id from public.products where slug = 'two-tier-wedding'), 'Two-Tier Wedding Cake', '5 Pound (2-tier)', 'Red Velvet', 8800, 1),
  ('40000000-0000-4000-8000-000000000009', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Chocolate Fudge', 3600, 1),
  ('40000000-0000-4000-8000-000000000010', (select id from public.products where slug = 'sports-theme'), 'Football / Sports Theme Cake', '3 Pound', 'Vanilla', 5200, 1),
  ('40000000-0000-4000-8000-000000000011', (select id from public.products where slug = 'assorted-cupcakes-12'), 'Assorted Cupcakes', 'Box of 12', 'Mixed', 2200, 1),
  ('40000000-0000-4000-8000-000000000012', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Butterscotch', 3600, 1),
  ('40000000-0000-4000-8000-000000000013', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Chocolate Fudge', 3600, 1),
  ('40000000-0000-4000-8000-000000000014', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '4 Pound', 'Red Velvet', 6800, 1),
  ('40000000-0000-4000-8000-000000000015', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '1 Pound', 'Chocolate Fudge', 1800, 1),
  ('40000000-0000-4000-8000-000000000016', (select id from public.products where slug = 'sports-theme'), 'Football / Sports Theme Cake', '3 Pound', 'Chocolate Fudge', 5200, 1),
  ('40000000-0000-4000-8000-000000000017', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Vanilla', 3600, 1),
  ('40000000-0000-4000-8000-000000000018', (select id from public.products where slug = 'assorted-cupcakes-12'), 'Assorted Cupcakes', 'Box of 12', 'Mixed', 2200, 1),
  ('40000000-0000-4000-8000-000000000019', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Red Velvet', 3600, 1),
  ('40000000-0000-4000-8000-000000000020', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Chocolate Fudge', 3600, 1),
  ('40000000-0000-4000-8000-000000000021', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Vanilla', 3600, 1),
  ('40000000-0000-4000-8000-000000000022', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '1 Pound', 'Butterscotch', 1800, 1),
  ('40000000-0000-4000-8000-000000000023', (select id from public.products where slug = 'classic-chocolate'), 'Classic Chocolate Birthday Cake', '2 Pound', 'Chocolate Fudge', 3600, 1);

insert into public.order_events (order_id, status, note, created_at)
  select id, status, 'Seed data.', created_at from public.orders where id <> '40000000-0000-4000-8000-000000000000';
