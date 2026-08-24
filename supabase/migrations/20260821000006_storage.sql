-- Phase 2 — storage buckets, per PLAN.md §5.
--
-- `products`, `categories`, `reviews` → public bucket, so reads need no
-- policy at all (Storage serves public-bucket objects directly). Only
-- writes are policed, admin-only.
--
-- `order-refs` → private bucket, anonymous INSERT (a customer attaching
-- a reference image to a custom-cake request or order), admin-only read.
--
-- `payment-proofs`, `receipts` → private, admin read *and* write. Note:
-- PLAN.md only says "private / admin read" for these two — unlike
-- order-refs it does not say "anonymous write". A customer's payment
-- proof upload during checkout therefore has to go through a trusted
-- server route (service-role key), not a direct anonymous client
-- upload — consistent with §8 rule 7 ("a client-sent total is never
-- trusted"), and left for the Phase 4 order engine to implement.

insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('reviews', 'reviews', true),
  ('order-refs', 'order-refs', false),
  ('payment-proofs', 'payment-proofs', false),
  ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- products, categories, reviews — public read (no policy needed), admin write
create policy "products_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());
create policy "products_bucket_update" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin()) with check (bucket_id = 'products' and public.is_admin());
create policy "products_bucket_delete" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());

create policy "categories_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'categories' and public.is_admin());
create policy "categories_bucket_update" on storage.objects
  for update using (bucket_id = 'categories' and public.is_admin()) with check (bucket_id = 'categories' and public.is_admin());
create policy "categories_bucket_delete" on storage.objects
  for delete using (bucket_id = 'categories' and public.is_admin());

create policy "reviews_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'reviews' and public.is_admin());
create policy "reviews_bucket_update" on storage.objects
  for update using (bucket_id = 'reviews' and public.is_admin()) with check (bucket_id = 'reviews' and public.is_admin());
create policy "reviews_bucket_delete" on storage.objects
  for delete using (bucket_id = 'reviews' and public.is_admin());

-- order-refs — anonymous write, admin read
create policy "order_refs_bucket_read" on storage.objects
  for select using (bucket_id = 'order-refs' and public.is_admin());
create policy "order_refs_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'order-refs');
create policy "order_refs_bucket_update" on storage.objects
  for update using (bucket_id = 'order-refs' and public.is_admin()) with check (bucket_id = 'order-refs' and public.is_admin());
create policy "order_refs_bucket_delete" on storage.objects
  for delete using (bucket_id = 'order-refs' and public.is_admin());

-- payment-proofs, receipts — private, admin read AND write
create policy "payment_proofs_bucket_read" on storage.objects
  for select using (bucket_id = 'payment-proofs' and public.is_admin());
create policy "payment_proofs_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'payment-proofs' and public.is_admin());
create policy "payment_proofs_bucket_update" on storage.objects
  for update using (bucket_id = 'payment-proofs' and public.is_admin()) with check (bucket_id = 'payment-proofs' and public.is_admin());
create policy "payment_proofs_bucket_delete" on storage.objects
  for delete using (bucket_id = 'payment-proofs' and public.is_admin());

create policy "receipts_bucket_read" on storage.objects
  for select using (bucket_id = 'receipts' and public.is_admin());
create policy "receipts_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'receipts' and public.is_admin());
create policy "receipts_bucket_update" on storage.objects
  for update using (bucket_id = 'receipts' and public.is_admin()) with check (bucket_id = 'receipts' and public.is_admin());
create policy "receipts_bucket_delete" on storage.objects
  for delete using (bucket_id = 'receipts' and public.is_admin());
