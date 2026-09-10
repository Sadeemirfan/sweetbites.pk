/**
 * Blog content is plain, hand-written copy - not admin-editable, since
 * there's no CMS for it (like branches.ts, changing a post means editing
 * this file and redeploying). Shared across all three branches: the
 * advice is genuinely the same everywhere, and `%CITY%` is swapped for
 * the branch's own city at render time rather than hardcoding one city.
 *
 * Every claim here has to hold for the real business - no prices (site
 * policy is "ask on WhatsApp"), no delivery/payment promises beyond what
 * the actual delivery and order policies already state, and no invented
 * stats or reviews. Flavours and cake styles named below are the ones
 * that actually exist in the gallery.
 */

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  publishedDate: string; // ISO date
  readTimeMinutes: number;
  body: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "birthday-cake-ideas",
    title: "Birthday Cake Ideas for Kids & Adults",
    excerpt:
      "From number cakes to hand-modelled cartoon characters - a few ideas to start from before you message us.",
    tag: "Birthday Cakes",
    publishedDate: "2026-08-10",
    readTimeMinutes: 4,
    body: [
      {
        type: "p",
        text: "A birthday cake works best when it matches the person, not a trend. Here's a quick guide to a few styles we make in %CITY%, so you have a starting point before you message us.",
      },
      { type: "h2", text: "For kids" },
      {
        type: "ul",
        items: [
          "Cartoon character cakes - hand-modelled in fondant from a reference picture you send us.",
          "Number or alphabet cakes - shaped as the birthday number or the child's initial.",
          "Rainbow sprinkle cake - a simple, colourful favourite that photographs well.",
        ],
      },
      { type: "h2", text: "For adults" },
      {
        type: "ul",
        items: [
          "Classic chocolate cake with silky buttercream - a safe, reliable choice for any age.",
          "Football or sports-theme cakes for the fan in the family - any team colours.",
          "A simple two-tier cake when the celebration is bigger than a single-tier occasion.",
        ],
      },
      {
        type: "p",
        text: "Whatever the design, tell us the occasion, the age, and any colours or characters you have in mind - we'll tell you honestly what's possible and confirm the price on WhatsApp before you order.",
      },
    ],
  },
  {
    slug: "wedding-tiered-cake-guide",
    title: "Choosing a Wedding or Walima Cake",
    excerpt:
      "Nikkah, mehndi, or walima - a short guide to picking between a single tier and a full multi-tier centrepiece.",
    tag: "Weddings",
    publishedDate: "2026-08-17",
    readTimeMinutes: 5,
    body: [
      {
        type: "p",
        text: "Wedding cakes in %CITY% usually come down to one question first: how many tiers does the event actually need? Here's how we'd think about it.",
      },
      { type: "h2", text: "Nikkah or an intimate gathering" },
      {
        type: "p",
        text: "A single tier is usually enough - a ring-shaped cake or a smaller centrepiece works well for a nikkah table without overwhelming it.",
      },
      { type: "h2", text: "Mehndi or barat" },
      {
        type: "p",
        text: "A two-tier cake is a common choice here - enough presence for a stage table, still practical to deliver and cut.",
      },
      { type: "h2", text: "A grand walima" },
      {
        type: "p",
        text: "For a bigger reception, a three (or more) tier cake works as the full statement piece for a walima or reception stage.",
      },
      { type: "h2", text: "Flavours" },
      {
        type: "p",
        text: "Vanilla, red velvet, black forest, and coffee walnut are popular choices for a wedding cake - though we're always happy to talk through what would suit your guests.",
      },
      {
        type: "p",
        text: "Every wedding cake is made to order, so message us the date, guest count, and tier preference on WhatsApp and we'll confirm the design and price with you directly - there's no fixed price list for these, since every one is a little different.",
      },
    ],
  },
  {
    slug: "eid-dessert-ideas",
    title: "Eid Dessert & Cake Ideas",
    excerpt: "A few ways to add something homemade to the Eid table this year, beyond the usual sweets.",
    tag: "Seasonal",
    publishedDate: "2026-08-24",
    readTimeMinutes: 3,
    body: [
      {
        type: "p",
        text: "Eid in %CITY% usually means a full table already - here are a few homemade additions that tend to disappear fastest when we make them for customers.",
      },
      {
        type: "ul",
        items: [
          "A fresh cheesecake or fusion dessert alongside the usual sweets, for something that isn't overly sweet.",
          "Cupcake boxes - easy to share when family is visiting through the day, and you can mix flavours in one box.",
          "A themed cake if the day doubles as a birthday or engagement celebration during the Eid holidays.",
        ],
      },
      {
        type: "p",
        text: "Eid is one of our busiest weeks, so if you know the date you'll need something, message us on WhatsApp a few days ahead rather than the night before.",
      },
    ],
  },
  {
    slug: "custom-cake-ordering-guide",
    title: "How to Order a Custom Cake",
    excerpt:
      "There's no order form on the site - here's exactly what happens when you message us about a custom design.",
    tag: "Ordering Guide",
    publishedDate: "2026-08-31",
    readTimeMinutes: 4,
    body: [
      {
        type: "p",
        text: "Every cake we make in %CITY% is made to order, and every order starts on WhatsApp - there's no checkout or order form on the site. Here's what that actually looks like.",
      },
      { type: "h2", text: "1. Send us a picture" },
      {
        type: "p",
        text: "If you've seen a design you like, send it to us along with your budget. We'll tell you honestly how close we can get to it and what it would cost - we'd rather say a design isn't possible than deliver something that disappoints you.",
      },
      { type: "h2", text: "2. We confirm the details" },
      {
        type: "p",
        text: "Size, flavour, message on the cake, and the date you need it - we confirm all of this with you directly. An order is only booked once we've replied with the price, date, and time slot, not the moment you send the first message.",
      },
      { type: "h2", text: "3. Extra customization is quoted upfront" },
      {
        type: "p",
        text: "Design changes, added toppers, hand-piped detail, and similar extras cost more than a standard cake - we'll always tell you the exact charge before you confirm, never after.",
      },
      { type: "h2", text: "4. Lead time" },
      {
        type: "p",
        text: "Two days is standard. Custom, theme, and tiered cakes need at least three days, and five or more for elaborate designs - the earlier you message us, the more room we have to get the design right.",
      },
    ],
  },
  {
    slug: "cake-storage-tips",
    title: "How to Store Your Cake After Delivery",
    excerpt: "No preservatives means a few simple habits matter - here's how to keep your cake at its best.",
    tag: "Care Tips",
    publishedDate: "2026-09-07",
    readTimeMinutes: 3,
    body: [
      {
        type: "p",
        text: "Because nothing we make has preservatives, a cake from us behaves a little differently to a shop-bought one. A few habits make a real difference.",
      },
      {
        type: "ul",
        items: [
          "Keep it refrigerated until roughly 20-30 minutes before serving, so the cream softens and the sponge isn't cold and firm.",
          "Best eaten within two days of delivery.",
          "Fresh cream and fruit cakes shouldn't sit out in the heat for long, even during the celebration itself.",
          "If you're transporting it further after delivery, keep it flat and out of direct sun.",
        ],
      },
      {
        type: "p",
        text: "If anything about your cake looks or tastes off, tell us the same day with a photo if you can - we'd much rather hear about it directly than have you assume it's normal.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function renderBlogText(text: string, city: string): string {
  return text.replaceAll("%CITY%", city);
}
