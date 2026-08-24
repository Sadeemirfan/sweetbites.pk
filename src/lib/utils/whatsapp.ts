import { BUSINESS, ORDER_LINK_ORIGIN } from "@/lib/constants";
import { formatPrice } from "@/lib/utils/format";
import {
  PAYMENT_METHOD_LABELS,
  TIME_SLOT_LABELS,
  type OrderSummary,
} from "@/lib/order/summary";

/*
 * NOTE ON "Assalam-o-Alaikum" - deliberate, confirmed by the owner.
 *
 * PLAN.md §0 requires the site to be English only, but that rule covers
 * site UI: headings, taglines, buttons, the footer. These templates are
 * a prefilled message the *customer* sends to the shop, and §6 and §13.4
 * both specify the greeting verbatim. Do not strip it.
 */

export function whatsappLink(message: string): string {
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Assalam-o-Alaikum Sweet Bites\n\nI'd like to order a cake.\n\nSent from sweetbites.pk";

export function productUrl(categorySlug: string, productSlug: string): string {
  return `${ORDER_LINK_ORIGIN}/gallery/${categorySlug}/${productSlug}`;
}

/**
 * The product order message, in the exact shape PLAN.md §6 specifies.
 * The product URL is included rather than an image file - WhatsApp
 * renders a link preview from it, which is cleaner and more reliable
 * than an attachment, and it tells the shop precisely which cake is
 * meant.
 */
export function buildProductMessage(input: {
  name: string;
  categorySlug: string;
  productSlug: string;
  size?: string | null;
  flavor?: string | null;
  price?: number | null;
  quantity?: number;
  cakeMessage?: string | null;
}): string {
  const descriptor = [input.name, input.size, input.flavor].filter(Boolean).join(" - ");

  const lines = ["Assalam-o-Alaikum Sweet Bites", "", "I'd like to order:", descriptor];

  if (input.quantity && input.quantity > 1) {
    lines.push(`Quantity: ${input.quantity}`);
  }
  if (input.price != null) {
    const total = input.price * (input.quantity && input.quantity > 1 ? input.quantity : 1);
    lines.push(`Price: ${formatPrice(total)}`);
  }
  if (input.cakeMessage?.trim()) {
    lines.push(`Message on cake: "${input.cakeMessage.trim()}"`);
  }

  lines.push("", productUrl(input.categorySlug, input.productSlug), "", "Sent from sweetbites.pk");

  return lines.join("\n");
}

export function productWhatsappLink(input: Parameters<typeof buildProductMessage>[0]): string {
  return whatsappLink(buildProductMessage(input));
}

/**
 * The complete order, pre-filled for the confirmation page's "Send order
 * on WhatsApp" button (§7 step 7) - items with sizes, flavours and cake
 * messages, the date and slot, fulfilment with its fees itemised, the
 * total, and the advance-payment note when it is a first order.
 *
 * Fees are listed as separate lines, matching what the customer was
 * shown at checkout (§7 step 3), so the shop and the customer are
 * reading the same breakdown.
 */
export function buildOrderMessage(order: OrderSummary): string {
  const lines: string[] = [
    "Assalam-o-Alaikum Sweet Bites",
    "",
    `I've placed order ${order.orderNumber} on the website.`,
    "",
  ];

  for (const item of order.items) {
    const descriptor = [item.name, item.sizeLabel, item.flavor].filter(Boolean).join(" - ");
    lines.push(`• ${descriptor}${item.qty > 1 ? ` ×${item.qty}` : ""} - ${formatPrice(item.lineTotal)}`);
    if (item.cakeMessage?.trim()) {
      lines.push(`  Message on cake: "${item.cakeMessage.trim()}"`);
    }
  }

  lines.push("", `Needed on: ${order.requiredDate}`);
  lines.push(`Time: ${TIME_SLOT_LABELS[order.timeSlot] ?? order.timeSlot}`);

  if (order.fulfillment === "pickup") {
    lines.push("Collection: Pickup from the shop");
  } else {
    lines.push(`Delivery to: ${order.deliveryAreaName ?? "Arifwala"}`);
    if (order.address) lines.push(`Address: ${order.address}`);
  }

  lines.push("", `Subtotal: ${formatPrice(order.subtotal)}`);
  if (order.deliveryFee > 0) lines.push(`Delivery charge: ${formatPrice(order.deliveryFee)}`);
  if (order.lateNightFee > 0) {
    lines.push(`Late-night charge: ${formatPrice(order.lateNightFee)}`);
  }
  lines.push(`Total: ${formatPrice(order.total)}`);
  lines.push(`Payment: ${PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}`);

  if (order.advanceRequired) {
    lines.push("", "This is my first order, so I understand full advance payment is required.");
  }

  lines.push("", "Sent from sweetbites.pk");
  return lines.join("\n");
}

export function orderWhatsappLink(order: OrderSummary): string {
  return whatsappLink(buildOrderMessage(order));
}

/** Handoff after a custom cake request is saved (PLAN.md §10). */
export function buildCustomCakeMessage(input: {
  occasion?: string | null;
  tiers?: number | null;
  weightKg?: number | null;
  flavor?: string | null;
  requiredDate?: string | null;
}): string {
  const lines = ["Assalam-o-Alaikum Sweet Bites", "", "I've just sent a custom cake request."];

  const detail = [
    input.occasion ? `Occasion: ${input.occasion}` : null,
    input.tiers ? `Tiers: ${input.tiers}` : null,
    input.weightKg ? `Approx. weight: ${input.weightKg} kg` : null,
    input.flavor ? `Flavour: ${input.flavor}` : null,
    input.requiredDate ? `Needed by: ${input.requiredDate}` : null,
  ].filter(Boolean) as string[];

  if (detail.length) lines.push("", ...detail);

  lines.push("", "Sent from sweetbites.pk");
  return lines.join("\n");
}
