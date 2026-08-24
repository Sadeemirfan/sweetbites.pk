# Sweet Bites Arifwala — sweetbites.pk
## Build Plan — FINAL

**Business:** Sweet Bites, Arifwala — homemade, made-to-order cakes
**Domain:** sweetbites.pk (owned)
**Hosting:** Cloudflare Workers
**Language:** English only, throughout the entire site
**Priority:** mobile first

> This file is the single source of truth. Read it fully before writing any code. Do not deviate from it and do not add anything it does not list.

---

## 0. Business facts

| Item | Value |
|---|---|
| Brand | Sweet Bites Arifwala |
| WhatsApp / Orders | 0321 7337801 (`wa.me/923217337801`) |
| Address | Near Masjid Riaz-ul-Jannah, Gulshan-e-Wahab Phase 2, Arifwala, Punjab |
| Hours | 8:00 AM – 10:00 PM, all 7 days |
| Instagram | instagram.com/sweetbitesarifwala |
| Facebook | facebook.com/SweetBitesArifwala |
| TikTok | tiktok.com/@sweetbitesarifwala |
| Threads | threads.com/@sweetbitesarifwala |
| Currency | PKR (Rs.) |
| **Site language** | **English only. No Urdu anywhere — not in headings, taglines, buttons, or the footer.** |

### Order rules

- **Lead time:** **every item needs a minimum of 2 days — there is nothing same-day and nothing next-day.** Custom / theme / tiered cakes: 3 days. Nothing is pre-made, so the rule has no exceptions; do not build a same-day path or a "ready now" badge.
- **Daily capacity:** none. Output ranges from 2–3 cakes to 50+. The system must never auto-block a date based on order count. Only the admin blocks dates, manually.
- **Delivery:** free anywhere inside Arifwala city **up to 10:00 PM**. Nearby villages and outlying areas are delivered with a charge that varies by location — the admin defines each area and its fee. No delivery to other cities.
- **Late-night delivery:** deliveries **after 10:00 PM carry an extra charge, including inside the city** where delivery is otherwise free. The amount is set by the admin in settings, not hardcoded. Two fees can therefore apply to one order: the area fee and the late-night fee. Show them as separate lines so the customer understands what they are paying for.
- **Pickup:** available from the shop, free.
- **Payment:** Cash on Delivery, JazzCash, Easypaisa, bank transfer.
- **Advance rule:** a customer's **first order requires full advance payment**. Returning customers may pay in advance or on delivery, their choice. "First order" is determined by phone-number lookup, since there are no accounts.

### Positioning

Every cake is made after the order is placed. Nothing is pre-made or sitting in a display case. That is why it takes 2–3 days, and it is the single biggest advantage over a commercial bakery. The lead time is presented as a promise, never hidden as a disclaimer.

---

## 1. Scope

**No customer accounts.** No sign up, sign in, password reset, order history, or favourites. Ordering works entirely without an account. Supabase Auth exists for **one purpose only**: protecting the admin dashboard.

**No order tracking page.** Once an order is placed the conversation moves to WhatsApp.

**The Gallery is the catalogue.** Not a decorative photo wall — the main browsing surface: categories, and inside each category the products with image, name, price, description, and a WhatsApp CTA.

**Orders arrive from four places, and all of them live in one place.** The website is only one channel. Most orders will still come by WhatsApp, Facebook, Instagram, or people walking in. The dashboard must let the admin enter those by hand in under a minute, so the database holds *every* order regardless of where it came from. Without that, every report and reminder in this system would be built on a fraction of the real business.

**The dashboard is a small business system, not just a website admin.** It covers orders (all channels), ingredient purchases and expenses, profit and loss over any date range, and customer occasion reminders. These are described in §13.

**Included:** Gallery/catalogue, Custom Cake request form, Customer Reviews, order flow ending in WhatsApp, full admin dashboard with expenses, reports, and reminders.

**Not included:** customer accounts, order tracking, coupons at launch, online payment gateway, blog, multi-language.

---

## 2. Design direction

### 2.1 Starting point: the logo

The supplied logo is a flowing cursive script reading "Sweet Bites" with a cupcake-and-swirl mark above it, in a soft dusty rose-brown sampled at **`#9A7170`**. Two prepared files ship with this plan:

- `logo-transparent.png` — original colour, transparent background, for light surfaces
- `logo-cream.png` — cream recolour, transparent background, for dark surfaces

The logo drives the palette. A delicate rose-brown script does not belong on a heavy black page, so the site is **cream-dominant with dark feature sections**, not the reverse.

> **Logo file note:** the source is 447×447 JPEG, low resolution for web. The prepared PNGs are clean enough for a header at normal sizes, but a vector redraw is worth commissioning later. Never render the logo above ~300px wide.

### 2.2 The concept — "Morning kitchen"

A home kitchen in daylight: warm cream surfaces, something in the oven, one dark moment where the oven door opens. The site is mostly light and readable, with two or three dark sections as punctuation — hero, process section, footer.

This is functional as well as aesthetic. Cream sections keep the catalogue legible on a phone in daylight; dark sections make photography and 3D look expensive. Alternating them creates rhythm without decoration.

### 2.3 Colour tokens

```css
--rosewood:   #9A7170;  /* brand colour, sampled from the logo */
--rosewood-d: #6E4B4A;  /* darker rosewood for text on cream */
--cocoa-900:  #241A1B;  /* dark sections — warm near-black, never pure black */
--cocoa-800:  #33262A;  /* raised surface on dark */
--cream-50:   #FAF5EE;  /* page background */
--cream-100:  #F3EADF;  /* alternate light section */
--cream-200:  #E6D8C8;  /* borders, dividers */
--ghee:       #C08A3E;  /* gold — prices and primary CTAs ONLY */
--pista:      #7E9A78;  /* secondary accent — sparing */
--ink:        #2A2022;  /* body text on cream */
--whatsapp:   #25D366;  /* WhatsApp buttons only, never decoration */
```

Discipline: `--ghee` for prices and primary CTAs. `--rosewood` is the brand voice — headings, rules, hover states. `--pista` appears rarely. `--whatsapp` only on actual WhatsApp buttons, where the familiar green is a usability asset.

### 2.4 Typography

| Role | Face | Notes |
|---|---|---|
| Display | **Fraunces** variable, `SOFT` + `WONK` axes on | Headings. Soft, slightly odd serifs echo the logo without competing with it. |
| Body | **General Sans** (fallback: Instrument Sans) | Paragraphs, buttons, forms |
| Utility | Body face, uppercase, `letter-spacing: 0.14em`, 12px | Eyebrows, labels, chips |

No script or handwriting font anywhere. The logo is the only cursive element on the site — a second one would cheapen it immediately.

Scale (rem, fluid via `clamp()`): `0.75 / 0.875 / 1 / 1.25 / 1.75 / 2.5 / 3.5 / 4.5`
Radii 4–8px. No pill buttons.

### 2.5 Signature element

**Cake assembly on scroll.** A pinned dark section where scrolling assembles a cake layer by layer — sponge, cream, sponge, frosting, drip, toppers — while short copy swaps alongside: *"Ingredients bought that morning" → "Cream whipped by hand" → "No preservatives" → "Ready on your date"*.

One element carrying 3D, animation, brand story, and the lead-time explanation together. **All the boldness is spent here.** Everything else stays quiet. That restraint is what separates a designed site from a generated one.

### 2.6 Mobile is the primary target

Most customers will open this on a phone, on mobile data. Every decision defers to that:

- Design mobile-first, then scale up.
- Minimum 44px touch targets.
- Sticky bottom bar on mobile with "Order on WhatsApp" always reachable.
- 3D skipped entirely on mobile — static image instead.
- Test at 360px, 390px, and 768px before considering anything done.

**The admin dashboard is mobile-first too.** The baker will use it standing in a kitchen with a phone in one hand. Manual order entry and expense entry in particular must be fast and thumb-friendly.

---

## 3. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict |
| Styling | Tailwind CSS v4 + CSS variables from §2.3 |
| UI primitives | shadcn/ui — **admin only**, public site stays custom |
| Animation | Framer Motion + GSAP ScrollTrigger |
| Smooth scroll | Lenis |
| 3D | React Three Fiber + drei, procedural, no GLB |
| Backend | Supabase — Postgres, Storage, RLS, Realtime; Auth for admin only |
| Forms | React Hook Form + Zod |
| State | Zustand (cart) |
| Dates | date-fns |
| Charts | Recharts — reports only |
| **Hosting** | **Cloudflare Workers via `@opennextjs/cloudflare`** |
| Images | Cloudflare Images or custom loader (see §3.1) |
| Analytics | Cloudflare Web Analytics + Google Search Console |

**Never use:** jQuery, Bootstrap, AOS.js, particles.js, gradient blob backgrounds, glassmorphism, emoji as icons, a second script font.

### 3.1 Cloudflare constraints — handle in Phase 1

Next.js does not run on Cloudflare natively; `@opennextjs/cloudflare` is required, and its constraints are painful to retrofit:

1. `wrangler.jsonc` needs `compatibility_flags: ["nodejs_compat"]` and a recent compatibility date, or `process.env` comes back empty.
2. **`sharp` does not run on Workers.** `next/image` needs Cloudflare Images or a custom loader — decided in Phase 1.
3. **Env vars split build-time vs runtime.** Supabase keys are needed in both.
4. ISR cache uses an R2 binding named `NEXT_INC_CACHE_R2_BUCKET`. The name is hardcoded by the adapter; renaming breaks caching silently.
5. **Windows:** OpenNext's build is not officially supported on Windows and the team recommends WSL. `next dev` works fine, so Phases 1–7 are unaffected. WSL only matters at deploy time.

Config is created in Phase 1 but never run. All development is local via `next dev`. The first Cloudflare build happens in Phase 8.

---

## 4. Sitemap

```
PUBLIC
/                               Home
/gallery                        All categories
/gallery/[category]             Products in that category
/gallery/[category]/[product]   Product detail + WhatsApp CTA
/custom-cake                    Custom cake request form
/reviews                        Customer reviews + submit form
/order                          Cart → date → fulfilment → contact → WhatsApp
/order/confirmed/[n]            Order number + WhatsApp button
/about                          Story, kitchen, why 2–3 days
/contact                        Map, WhatsApp, hours, socials
/faq
/policies/order  /policies/delivery

ADMIN  (Supabase Auth, admin role, middleware protected)
/admin/login
/admin                          Today's view — KPIs, 7-day calendar, reminders
/admin/kitchen                  Day view + printable baking sheet
/admin/orders                   Kanban by status, all channels
/admin/orders/new               MANUAL ORDER ENTRY — WhatsApp, socials, walk-in
/admin/orders/[id]              Detail + WhatsApp customer + print slip
/admin/expenses                 Purchase & expense log
/admin/expenses/new             Quick expense entry
/admin/reports                  Income vs expenses, any date range
/admin/customers                Customer list, history, occasion dates
/admin/customers/[id]           One customer's full history
/admin/reminders                Upcoming occasion reminders
/admin/categories               CRUD — how the gallery grows
/admin/products                 CRUD + image upload
/admin/custom-requests          Inbox + quote reply
/admin/reviews                  Approve / reject
/admin/availability             Manual date blocking
/admin/delivery-areas           Area + fee
/admin/settings                 Site text, WhatsApp, hours, payment details
```

No `/login`, no `/signup`, no `/account`, no `/track`.

---

## 5. Database schema

```sql
-- ADMIN USERS ONLY. Customers never appear here.
profiles (
  id uuid PK REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at timestamptz DEFAULT now()
)

categories (
  id uuid PK, name text, slug text UNIQUE, description text,
  image_url text, sort_order int, is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
)

products (
  id uuid PK, category_id uuid FK, name text, slug text UNIQUE,
  description text,
  base_price numeric, cost_estimate numeric,   -- optional, for rough margin
  image_url text, images jsonb,
  sizes jsonb,      -- [{label:"1 Pound", weight_kg:0.45, price:1800}, ...]
  flavors jsonb,
  lead_time_days int DEFAULT 2,
  is_featured bool DEFAULT false, is_active bool DEFAULT true,
  sort_order int, created_at timestamptz DEFAULT now(),
  UNIQUE (category_id, slug)
)

addons (id uuid PK, name text, price numeric, is_active bool DEFAULT true)

-- CUSTOMERS — no accounts, no login. Keyed by phone, upserted automatically
-- whenever an order is created from any channel.
customers (
  id uuid PK,
  phone text UNIQUE NOT NULL,
  name text, whatsapp text, address text,
  area_id uuid FK NULL,
  first_order_date date, last_order_date date,
  total_orders int DEFAULT 0, total_spent numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
)

orders (
  id uuid PK,
  order_number text UNIQUE,             -- SB-0821-0147
  customer_id uuid FK NULL,
  source text NOT NULL DEFAULT 'website'
    CHECK (source IN ('website','whatsapp','facebook','instagram','tiktok','walk_in','phone','other')),
  customer_name text, phone text NOT NULL, whatsapp text,
  fulfillment text CHECK (fulfillment IN ('pickup','delivery')),
  delivery_area_id uuid FK NULL, address text,
  required_date date NOT NULL,
  time_slot text
    CHECK (time_slot IN ('10-1','1-4','4-7','7-10','after-10')),
  subtotal numeric,
  delivery_fee numeric DEFAULT 0,       -- area fee
  late_night_fee numeric DEFAULT 0,     -- applies when time_slot = 'after-10'
  discount numeric DEFAULT 0, total numeric,
  is_first_order bool DEFAULT false,
  advance_required bool DEFAULT false,
  advance_paid numeric DEFAULT 0,
  payment_method text CHECK (payment_method IN ('cod','jazzcash','easypaisa','bank')),
  payment_status text DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','partial','paid')),
  payment_proof_url text,
  -- OCCASION — powers the yearly reminder system
  occasion text CHECK (occasion IN ('birthday','anniversary','wedding','graduation','religious','other','none')),
  occasion_person text,                 -- "Ayesha", from the cake message
  occasion_date date,                   -- the actual event date, usually = required_date
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','baking','ready','out_for_delivery','completed','cancelled')),
  customer_note text, admin_note text,
  created_at timestamptz DEFAULT now()
)

order_items (
  id uuid PK, order_id uuid FK ON DELETE CASCADE, product_id uuid FK NULL,
  name_snapshot text, size_label text, flavor text, weight_kg numeric,
  unit_price numeric, qty int,
  cake_message text, addons jsonb, reference_image_url text
)

order_events (id uuid PK, order_id uuid FK, status text, note text,
              created_at timestamptz DEFAULT now())

-- EXPENSES & PURCHASES
expense_categories (
  id uuid PK, name text UNIQUE,         -- Ingredients, Packaging, Fuel, Utilities,
  sort_order int, is_active bool        -- Equipment, Delivery, Marketing, Other
)

expenses (
  id uuid PK,
  category_id uuid FK,
  item text NOT NULL,                   -- "Flour", "Cream", "Cake boxes"
  vendor text,                          -- where it came from
  quantity numeric, unit text,          -- 20, "kg"
  unit_price numeric,                   -- optional, per unit
  amount numeric NOT NULL,              -- total paid
  purchased_on date NOT NULL,
  payment_method text,
  note text, receipt_url text,
  created_at timestamptz DEFAULT now()
)

-- REMINDERS — generated from orders, but dismissible and annotatable
reminder_log (
  id uuid PK,
  order_id uuid FK, customer_id uuid FK,
  reminder_date date,                   -- the date we surface it
  occasion_date date,                   -- the original anniversary
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','contacted','ordered','dismissed')),
  note text, created_at timestamptz DEFAULT now(),
  UNIQUE (order_id, reminder_date)
)

custom_cake_requests (
  id uuid PK, name text, phone text,
  occasion text, tiers int, weight_kg numeric, flavor text,
  theme_description text, reference_images jsonb,
  budget_min numeric, budget_max numeric, required_date date,
  status text DEFAULT 'new'
    CHECK (status IN ('new','quoted','accepted','declined','converted')),
  quoted_price numeric, admin_reply text, created_at timestamptz DEFAULT now()
)

-- No capacity columns anywhere, by design
availability_rules (id uuid PK, weekday int, is_open bool DEFAULT true)
blackout_dates (id uuid PK, date date UNIQUE, reason text)

delivery_areas (
  id uuid PK, name text,
  fee numeric DEFAULT 0,                -- inside Arifwala city = 0
  is_inside_city bool DEFAULT true,
  is_active bool DEFAULT true, sort_order int
)

reviews (
  id uuid PK, customer_name text, rating int CHECK (rating BETWEEN 1 AND 5),
  body text, image_url text,
  is_approved bool DEFAULT false, created_at timestamptz DEFAULT now()
)

site_settings (key text PK, value jsonb, updated_at timestamptz)
```

**Indexes:** `orders(required_date)`, `orders(status)`, `orders(order_number)`, `orders(phone)`, `orders(customer_id)`, `orders(source)`, `orders(created_at)`, `order_items(order_id)`, `customers(phone)`, `expenses(purchased_on)`, `expenses(category_id)`, `products(category_id)`, `products(slug)`.

Also index the month-day of `occasion_date` for the reminder query — either an expression index on `(EXTRACT(MONTH FROM occasion_date), EXTRACT(DAY FROM occasion_date))` or a generated `occasion_md text` column.

**Order number:** Postgres function producing `SB-MMDD-NNNN` with a daily sequence, as a BEFORE INSERT trigger.

**Customer upsert trigger:** on order insert, upsert `customers` by phone and update `total_orders`, `total_spent`, `first_order_date`, `last_order_date`. This must fire for **every** order regardless of `source`, so manual entries build the customer history exactly like website orders do.

### RLS

| Table | Read | Write |
|---|---|---|
| categories, products, addons, delivery_areas | public where `is_active` | admin only |
| reviews | public where `is_approved` | INSERT anyone; UPDATE/DELETE admin |
| orders, order_items, order_events | **admin only** | INSERT anyone; UPDATE/DELETE admin |
| customers, expenses, expense_categories, reminder_log | **admin only** | **admin only** |
| custom_cake_requests | admin only | INSERT anyone; UPDATE admin |
| availability_rules, blackout_dates, site_settings | public | admin |
| profiles | own row or admin | admin |

Anonymous users can create orders, reviews, and custom requests, but read none of them back. There is no customer-facing read path for order data at all — that is what makes an account-free site safe. Customer records, expenses, and reminders are admin-only in both directions; none of that data is ever exposed publicly.

Helper: `is_admin()` — SQL, `security definer`, `stable`.

**Storage:** `products`, `categories`, `reviews` (public read); `order-refs` (anonymous write / admin read); `payment-proofs`, `receipts` (private / admin read).

**Admin creation is manual.** Create the user in the Supabase dashboard and insert the `profiles` row by hand. No signup route, no invite flow, no code path that creates an admin.

---

## 6. The Gallery — main catalogue

The heart of the public site.

### /gallery
Category grid. Each card: category image, name, product count. Categories come from the database and are managed in the dashboard, so new ones appear without a code change.

### /gallery/[category]
Products in that category. Each card: photo, name, starting price, one line of description. Two actions — open the product, or send it straight to WhatsApp.

### /gallery/[category]/[product]
- Image gallery, first image large
- Name, price by size, flavour list, description
- Size selector, flavour selector, quantity, cake message field
- **Primary CTA: "Order on WhatsApp"** — opens WhatsApp with product name, size, flavour, price, and the product page URL, so the shop sees exactly which cake is meant
- Secondary: "Add to order" for a multi-item cart via the normal checkout

Every product card and product page carries a WhatsApp action. Many customers will never touch the checkout — they will browse, find a cake, and tap through to WhatsApp. **That path must be the smoothest one on the site.**

```
Assalam-o-Alaikum Sweet Bites

I'd like to order:
Chocolate Fudge Cake — 2 Pound — Chocolate
Price: Rs. 3,600

https://sweetbites.pk/gallery/cakes/chocolate-fudge

Sent from sweetbites.pk
```

Include the product URL rather than a raw image file — WhatsApp renders a link preview with the image, cleaner and more reliable than attaching one.

---

## 7. Order flow (website channel)

1. **Cart** — slide-over panel, Zustand, localStorage.
2. **Date & time** — see §8.
3. **Fulfilment** — Pickup (free) or Delivery. If delivery, pick an area: inside-city shows "Free delivery", outlying villages show their own fee. Then pick a time slot: 10-1, 1-4, 4-7, and 7-10 are normal; **"After 10 PM" adds the late-night fee from settings, on top of any area fee and even inside the city.** Label that slot clearly with its cost before it is selected — never surprise the customer with the charge at the total. Show area fee and late-night fee as separate lines. Total updates live.
4. **Contact** — name, phone, WhatsApp number, address if delivering. No account, no password.
5. **Occasion (optional)** — "What's this cake for?" with occasion type and the person's name. One extra tap, and it is what makes the reminder system in §13.4 work a year later. Keep it optional and light; never block checkout on it.
6. **Payment** — Cash on Delivery, JazzCash, Easypaisa, bank transfer. Server checks the phone against past orders; if none, this is a first order and the page states clearly that **full advance payment is required**, showing account details from settings with an optional payment-proof upload. Returning customers see all methods with no advance requirement.
7. **Confirm** — order saves to Supabase, then `/order/confirmed/[orderNumber]` shows the order number and a large **"Send order on WhatsApp"** button with the full order pre-filled.

The website records the order; WhatsApp is where the conversation continues. Both matter — the database gives the admin real reports, the WhatsApp handoff keeps the business running the way it already runs.

---

## 8. Lead-time logic

Pure, testable functions in `src/lib/availability.ts`:

1. `minDate = today + max(lead_time_days across cart items)` — default 2, custom/tiered 3.
2. Orders placed after **6:00 PM** add one more day; ingredients are bought in the morning.
3. `blackout_dates` are disabled.
4. **No capacity-based blocking, ever.** Output varies from 2 to 50+ per day. The admin sees each day's order count and decides; the system never decides.
5. Custom requests: minimum 3 days, 5+ recommended.
6. **Re-validate server-side** before insert. Client checks are for UX only.
7. **Recalculate totals server-side** from database prices. A client-sent total is never trusted.

These rules apply to the **website channel only**. Manual admin entry bypasses them entirely — see §13.1.

UI, framed as a promise:

> **The earliest we can have your cake ready is Tuesday, 25 August.**
> Every cake is baked after you order it — we don't keep ready-made stock.

Disabled dates show their reason on tap or hover: "Needs 2 days", "Closed", or the blackout reason. Never disable a date silently.

---

## 9. Home page

1. **Hero** (dark) — 3D cake, cream logo, "Arifwala's own homemade cake studio", two CTAs (Order on WhatsApp / Browse the gallery), live earliest-date line.
2. **Assembly / process** (dark, pinned) — the signature element.
3. **Browse by category** (cream) — live from the database.
4. **Bestsellers** (cream) — 6 featured products with prices and WhatsApp actions.
5. **Custom cakes** (dark) — past work carousel + link to the request form.
6. **Why Sweet Bites** (cream) — made to order, no preservatives, free delivery in Arifwala, 7 days a week.
7. **"Why 2 days?"** — four steps turning the objection into trust.
8. **Reviews** (cream) — three approved + link to all.
9. **Location & hours** (dark) — map, address, WhatsApp CTA.
10. **Footer** (dark) — cream logo, links, socials, hours, address in English.

Prices always visible. Never "contact for price" — local customers check price first, and hiding it loses them.

---

## 10. Custom cake request form

Five steps, no reloads: occasion → size and tiers → flavour → theme description with reference image upload → date and contact.

Saves to `custom_cake_requests` and offers a WhatsApp handoff on submission. Minimum 3 days out, 5+ recommended for elaborate work.

---

## 11. Reviews

Public page listing approved reviews with name, rating, text, optional photo. A submit form writes an unapproved row; the admin approves before it appears. Basic rate limiting and a honeypot field.

---

## 12. Admin dashboard — core

Different visual register from the public site: cream, dense, functional, fast. The public hero aesthetic does not carry over. **The user is a home baker on a phone, not a developer** — nothing should take more than two taps, and every screen must work properly at 390px.

**/admin/login** — email and password. The only auth surface on the entire site.

**/admin** — the day's control panel:
- KPI cards: today's orders, today's revenue, pending confirmations, unpaid advances
- 7-day calendar with each day's order count — the main element, not the KPIs
- **Reminders due strip** — occasions coming up in the next few days (§13.4)
- Recent orders across all channels, with a channel badge on each

**/admin/kitchen — the most valuable screen.** Pick a date, see every cake due: flavour, size, cake message, customer, phone, time slot, pickup or delivery. **Print button producing a clean A4 baking sheet** with checkboxes, large type, grouped by time slot. Phones are awkward in a kitchen, so the printed sheet has to be genuinely good.

**/admin/orders** — kanban, columns = statuses, drag to move, every move writing an `order_events` row. Filters by date, status, fulfilment, **source channel**, phone, order number. First orders and unpaid advances flagged visibly. A prominent "New order" button leading to manual entry.

**/admin/orders/[id]** — items, cake messages, reference image, payment proof, payment status, occasion fields, admin note, timeline, "WhatsApp customer" button, print slip.

**/admin/categories** — CRUD with image upload and drag-to-reorder. This is how the gallery grows, so make it obvious and pleasant.

**/admin/products** — table plus side drawer. Drag-drop upload to Supabase Storage with WebP conversion. Sizes and flavours as repeatable fields. Optional `cost_estimate` field. Active and featured toggles. Drag to reorder.

**/admin/custom-requests** — inbox with reference images, reply with a quote, convert accepted requests into orders.

**/admin/reviews** — approve or reject, with the photo if present.

**/admin/availability** — month calendar showing each day's order count so the baker can judge their own load. Click a day to block it manually with a reason. **The system never blocks a day on its own.**

**/admin/delivery-areas** — name, fee, inside/outside city. Inside-city defaults to free; outlying villages get their own charge.

**/admin/settings** — headline text, WhatsApp number, hours, social links, announcement bar, JazzCash / Easypaisa / bank details, and the **late-night delivery fee** applied to the "After 10 PM" slot. Changing site text or any fee must never require a developer.

**One admin account.** There is exactly one user. Build no user-management screen, no invite flow, no roles beyond `admin`, and no "team" concept — every one of those is code that will never be used. If a second person is needed later, a second row is added by hand in the Supabase dashboard.

**Realtime:** subscribe to `orders` INSERT → toast + soft chime.

---

## 13. Admin dashboard — business tools

This section is what turns the dashboard from a website admin into something the business actually runs on.

### 13.1 Manual order entry — `/admin/orders/new`

The website is one channel among several. Orders arriving by WhatsApp, Facebook, Instagram, phone, or in person get typed in here, and from that moment they are indistinguishable from website orders in every list, calendar, report, and reminder.

**Design priority: speed.** This form gets used while a customer is waiting on WhatsApp. Target under 60 seconds, one-handed, on a phone.

- **Source selector first** — WhatsApp / Facebook / Instagram / TikTok / Phone / Walk-in / Other. Stored in `orders.source`.
- **Phone number second, and it drives everything.** On entry, look up `customers`. If found, auto-fill name, WhatsApp, address, and area, and show a compact history line: *"4 previous orders, last on 12 June."* If not found, mark it as a first order.
- Items: pick from products with size and flavour, or add a free-text line with a price for something not in the catalogue. **Free-text items are essential** — real orders often don't match the catalogue exactly, and forcing them to would make the admin avoid the form entirely.
- Cake message, required date, time slot.
- Pickup or delivery with area and auto-filled fee, overridable.
- Occasion type and person's name — optional, and the field that feeds §13.4 next year.
- Payment method, amount received, payment status (unpaid / partial / paid).
- Admin note.

**Manual entry bypasses all lead-time validation.** If the baker says a cake is going out tomorrow, the system accepts it. The 2-day rule is a promise made to website customers, not a constraint on the business owner. Show a soft warning, never a block.

### 13.2 Expenses — `/admin/expenses`

Every purchase for the business: ingredients, packaging, fuel, utilities, equipment, delivery costs.

**Quick entry form** — item, category, vendor, quantity and unit, amount, date, optional note and receipt photo. Same speed target as order entry; this gets filled in standing at a shop counter.

**List view** — filter by date range, category, and vendor. Sort by date or amount. Running total for the current filter always visible.

**Recent items autocomplete** — after a few weeks the same twenty items repeat. Typing "fl" should offer "Flour" with the last price paid pre-filled. This is the difference between an expense log that gets used and one that gets abandoned in week three.

Default categories seeded: Ingredients, Packaging, Fuel, Utilities, Equipment, Delivery, Marketing, Other.

### 13.3 Reports — `/admin/reports`

Income and expenses over any period.

**Range picker:** Today, Yesterday, Last 7 days, This month, Last month, This year, and Custom range. Custom range is not an afterthought — it is how the baker will check a specific wedding week or a festival period.

**What it shows:**
- Total income (sum of order totals in the range, excluding cancelled)
- Total expenses (sum of expenses in the range)
- Net (income − expenses)
- Order count, average order value
- Income split by source channel — which channel actually brings orders
- Expenses split by category
- A line chart of income vs expenses over the range
- Top products by revenue
- Export to CSV

**An honest caveat that must appear in the interface, not just in this document:**

Ingredients are bought in bulk and used over weeks. A day when 20kg of flour is purchased will show a large loss; the days that flour is baked into cakes will show inflated profit. **Daily and weekly net figures will swing and are not a reliable measure of profitability. Monthly net is meaningful; anything shorter is not.**

Show income and expenses as two separate primary numbers, with net below them and a short one-line note explaining this on any range shorter than a month. Do not present a daily "profit" figure as though it were real — a number that looks precise and is misleading is worse than no number.

If the optional `cost_estimate` per product is filled in, a rough per-order margin can be shown as a secondary, clearly-labelled estimate. It is not accounting, and the interface should say so.

### 13.4 Customers & occasion reminders — `/admin/customers`, `/admin/reminders`

This is the feature with the highest commercial value in the whole system, and it costs one optional field at order time.

**Customer list** — name, phone, total orders, total spent, last order date, upcoming occasion. Search by name or phone. Tap through to a full history with every order, every occasion, and a free-text notes field ("prefers less sugar", "always orders for her son").

**How reminders work:**

1. Any order with an `occasion` and `occasion_date` becomes a recurring annual marker.
2. Each day, the system finds orders whose `occasion_date` falls on the same month and day as **today + 2 days**, in any previous year.
3. Those surface on `/admin` and `/admin/reminders` as: *"Ayesha's birthday is in 2 days (23 August). Fatima Bibi ordered a 2 Pound Chocolate Fudge for it last year — Rs. 3,600."*
4. One tap opens WhatsApp with a pre-written, editable message.
5. The reminder is logged in `reminder_log` and marked contacted, ordered, or dismissed — so it isn't shown again this year and the baker can see what came of it.

**Suggested WhatsApp template:**

```
Assalam-o-Alaikum Fatima!

Ayesha's birthday is coming up on 23 August — last year we made
her a 2 Pound Chocolate Fudge cake.

Would you like us to make something for her again this year?
We'd need 2 days' notice.

— Sweet Bites Arifwala
```

**Two things to get right:**

- **Two days' notice is the whole point.** The reminder must arrive early enough that the customer can still order within the lead time. A same-day reminder is useless.
- **Give the baker control over the tone.** The message opens in WhatsApp pre-filled but fully editable. A message that reads as automated marketing will do more harm than good in a town this size, where the shop's reputation is personal. This works precisely because it feels like the baker remembered.

A "This week" and "This month" view of upcoming occasions helps with planning ahead of festival periods.

---

## 14. Animation & 3D

### Motion inventory — the complete list

| Where | What | Tool |
|---|---|---|
| Page load | Hero words staggered mask reveal, 60ms stagger | Framer Motion |
| Hero | 3D cake auto-rotate 0.15 rad/s, mouse parallax max 8° | R3F |
| Assembly section | Pinned 400vh, scroll drives layer stacking + camera dolly + copy swap | GSAP ScrollTrigger |
| Section change | Cream ↔ dark clip-path wipe, not a fade | GSAP |
| Product cards | Hover tilt max 5°, image scale 1.04, price underline draws in `--ghee` | Framer Motion |
| Buttons | Magnetic pull within 40px, fill wipe from left | Framer Motion |
| Stats | Count up on in-view | Framer Motion |
| Forms | Label rises on focus, `--ghee` ring, one 150ms error shake | CSS + FM |
| Admin | Realtime order toast + chime | Supabase Realtime |

Nothing beyond this list. Animating every section is exactly what makes a site feel generated. **The admin dashboard gets no decorative animation at all** — it is a tool, and speed is the only thing that matters there.

### Performance — non-negotiable

- 3D is a dynamic import, `ssr: false`, static hero image as Suspense fallback.
- **Mobile or `deviceMemory < 4` → skip 3D entirely.** Most customers are on mobile data; a laggy hero costs orders.
- `dpr={[1, 1.75]}`, drei `AdaptiveDpr`, `frameloop="demand"` where possible.
- `prefers-reduced-motion: reduce` → all motion off, layout intact.
- Targets: LCP < 2.5s, CLS < 0.1 on throttled mobile. **If 3D breaks the budget, cut the 3D.**

### 3D approach

Procedural in R3F — no GLB, no modelling cost, near-zero bundle weight, individually animatable layers.

- Stacked cylinders for sponge, thin cylinders for cream, torus-ish drip edge, spheres for berries.
- Frosting: `MeshPhysicalMaterial`, clearcoat ~0.3, sheen on, roughness ~0.6. Soft buttercream, not plastic.
- Lighting: warm key `#FFD9A0` intensity 2.2 top-front, cool rim `#B8C4D9` behind, environment preset `"apartment"`.

---

## 15. SEO

- Per-page `metadata`. Pattern: `Custom Birthday Cakes in Arifwala | Sweet Bites`
- **JSON-LD `Bakery`** with `geo`, `openingHoursSpecification` 08:00–22:00 daily, `telephone`, all four `sameAs` links, `areaServed: Arifwala`.
- `Product` schema per product; `AggregateRating` from approved reviews.
- Targets: `cake in Arifwala`, `birthday cake Arifwala`, `custom cake Arifwala`, `homemade cake Arifwala`, `cake delivery Arifwala`, `bakery Arifwala`.
- `sitemap.ts`, `robots.ts`, OG image per page type.
- **Claim the Google Business Profile** — for a local shop it drives more traffic than the website does. Link the site there, link it back in the footer.
- Put `sweetbites.pk` in all four social bios.
- `/admin/*` must be `noindex`.

---

## 16. Build phases

| # | Phase | Deliverable | Est. |
|---|---|---|---|
| 1 | Foundation | Next.js + TS + Tailwind v4, tokens, fonts, logo, layout shell, Lenis, Cloudflare config created but not run | 1 day |
| 2 | Supabase | Full schema, RLS, buckets, triggers, seed data, admin auth, middleware | 2 days |
| 3 | Public site | Home, gallery, products, custom cake, reviews, about, contact, FAQ. No 3D. | 3–4 days |
| 4 | Order engine | Cart, availability logic, checkout, first-order advance rule, occasion capture, WhatsApp handoff | 2–3 days |
| 5 | Admin core | Login, dashboard, kitchen view, orders kanban, manual order entry, products, categories, settings | 3–4 days |
| 6 | Business tools | Expenses, reports, customers, occasion reminders | 2–3 days |
| 7 | 3D + motion | R3F hero, pinned assembly, micro-interactions, mobile fallbacks | 2–3 days |
| 8 | Launch | Lighthouse, a11y, error states, OpenNext build, Cloudflare deploy, DNS, GSC | 1–2 days |

**Total: roughly 16–22 working days.**

3D comes second-to-last deliberately. The site must work before it looks premium.

---

## 17. Content needed from the client

Before Phase 3:

- [x] Logo — supplied (`logo-transparent.png`, `logo-cream.png`)
- [x] Price list and flavour list — supplied
- [ ] **Product photos** — 2–3 per item, daylight, plain background. **This is 60% of whether the site looks premium.** Stock or AI-generated cake images will undo the entire design.
- [ ] Category list with one representative photo each
- [ ] Outlying village / area names with each one's delivery charge
- [ ] JazzCash, Easypaisa, and bank account details for advance payments
- [ ] 8–12 past custom cake photos
- [ ] 4–6 real customer reviews (WhatsApp screenshots are a fine source)
- [ ] 2–3 kitchen or process photos for the about page

Optional but valuable before Phase 6: past customer records — name, phone, order date, occasion. Even a rough list from WhatsApp history gives the reminder system a full year of history to work with immediately, instead of starting empty.

---

## 18. Post-launch

- Online payment gateway (Safepay / PayFast)
- WhatsApp Business API for automated status updates
- Per-recipe ingredient costing for real per-cake margins
- Low-stock alerts from the expense log
- Coupons and seasonal offers
- Corporate and bulk order page
- Ramadan / Eid seasonal menus
