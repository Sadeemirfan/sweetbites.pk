import { ORDER_LINK_ORIGIN } from "@/lib/constants";
import type { Branch } from "@/lib/branches";

/*
 * NOTE ON "Assalam-o-Alaikum" - deliberate, confirmed by the owner.
 *
 * PLAN.md §0 requires the site to be English only, but that rule covers
 * site UI: headings, taglines, buttons, the footer. These templates are
 * a prefilled message the *customer* sends to the shop, and §6 and §13.4
 * both specify the greeting verbatim. Do not strip it.
 *
 * Every link below takes the branch's own WhatsApp number explicitly -
 * there are three shops now, and a message meant for Lahore must never
 * land on Arifwala's phone.
 */

export function whatsappLink(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function defaultWhatsappMessage(businessName: string): string {
  return `Assalam-o-Alaikum ${businessName}\n\nI'd like to order a cake.\n\nSent from sweetbites.pk`;
}

export function productUrl(branch: Branch, categorySlug: string, productSlug: string): string {
  return `${ORDER_LINK_ORIGIN}/${branch}/gallery/${categorySlug}/${productSlug}`;
}

/**
 * The product order message, in the exact shape PLAN.md §6 specifies.
 * The product URL is included rather than an image file - WhatsApp
 * renders a link preview from it, which is cleaner and more reliable
 * than an attachment, and it tells the shop precisely which cake is
 * meant.
 */
export function buildProductMessage(input: {
  businessName: string;
  branch: Branch;
  name: string;
  categorySlug: string;
  productSlug: string;
  size?: string | null;
  flavor?: string | null;
  quantity?: number;
  cakeMessage?: string | null;
}): string {
  const descriptor = [input.name, input.size, input.flavor].filter(Boolean).join(" - ");

  const lines = [`Assalam-o-Alaikum ${input.businessName}`, "", "I'd like to order:", descriptor];

  if (input.quantity && input.quantity > 1) {
    lines.push(`Quantity: ${input.quantity}`);
  }
  if (input.cakeMessage?.trim()) {
    lines.push(`Message on cake: "${input.cakeMessage.trim()}"`);
  }

  lines.push(
    "",
    productUrl(input.branch, input.categorySlug, input.productSlug),
    "",
    "Sent from sweetbites.pk"
  );

  return lines.join("\n");
}

export function productWhatsappLink(
  whatsappNumber: string,
  input: Parameters<typeof buildProductMessage>[0]
): string {
  return whatsappLink(whatsappNumber, buildProductMessage(input));
}
