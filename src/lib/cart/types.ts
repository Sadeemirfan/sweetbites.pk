export type CartAddon = { id: string; name: string; price: number };

/**
 * One cart line. `id` identifies the line, not the product - the same
 * cake in two sizes is two lines.
 *
 * `addons` and `referenceImageUrl` are carried through to order_items
 * because the schema and the order flow support them, but nothing in the
 * public catalogue populates them yet: the `addons` table is empty, and
 * reference images are collected by the custom-cake form rather than at
 * checkout. They are wired end to end so neither needs a migration or a
 * checkout change when the admin starts using them.
 */
export type CartItem = {
  id: string;
  productId: string;
  categorySlug: string;
  productSlug: string;
  name: string;
  imageUrl: string | null;
  sizeLabel: string | null;
  weightKg: number | null;
  flavor: string | null;
  unitPrice: number;
  qty: number;
  cakeMessage: string;
  addons: CartAddon[];
  referenceImageUrl: string | null;
  /** Drives minDate across the cart - §8 rule 1. */
  leadTimeDays: number;
};

export type NewCartItem = Omit<CartItem, "id">;
