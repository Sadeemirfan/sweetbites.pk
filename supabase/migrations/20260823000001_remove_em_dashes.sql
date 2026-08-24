-- Remove em dashes from all customer-facing text.
--
-- The owner asked for them gone from the whole site. They live in seeded
-- copy as well as in components, so the database rows need the same
-- treatment: replaced with a plain hyphen, keeping the spacing.
update public.products
   set description = replace(description, ' — ', ' - ')
 where description like '%—%';
update public.products
   set description = replace(description, '—', '-')
 where description like '%—%';

update public.categories
   set description = replace(description, ' — ', ' - ')
 where description like '%—%';
update public.categories
   set description = replace(description, '—', '-')
 where description like '%—%';

update public.reviews
   set body = replace(body, ' — ', ' - ')
 where body like '%—%';
update public.reviews
   set body = replace(body, '—', '-')
 where body like '%—%';

update public.orders
   set admin_note = replace(admin_note, '—', '-')
 where admin_note like '%—%';
update public.orders
   set customer_note = replace(customer_note, '—', '-')
 where customer_note like '%—%';

update public.order_events
   set note = replace(note, '—', '-')
 where note like '%—%';

update public.expenses
   set note = replace(note, '—', '-')
 where note like '%—%';

update public.site_settings
   set value = to_jsonb(replace(value #>> '{}', '—', '-'))
 where jsonb_typeof(value) = 'string'
   and value #>> '{}' like '%—%';
