"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";
import { formatChosenDate } from "@/components/ui/DatePicker";
import { orderWhatsappLink, whatsappLink } from "@/lib/utils/whatsapp";
import {
  OCCASION_LABELS,
  PAYMENT_METHOD_LABELS,
  TIME_SLOT_LABELS,
  type OrderSummary,
} from "@/lib/order/summary";
import { BUSINESS } from "@/lib/constants";

/**
 * Renders from the summary the checkout handed over in sessionStorage,
 * never from the database: §5 gives anonymous visitors no read path to
 * order data, and that is exactly what makes an account-free site safe.
 *
 * sessionStorage survives a reload of this tab, so the usual refresh
 * still works. Opening the URL in a new tab or on another device shows
 * the fallback below - the order number and a way to reach the shop,
 * which is everything a customer actually needs at that point.
 */
export function Confirmation({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`sweetbites-order-${orderNumber}`);
      if (raw) setOrder(JSON.parse(raw) as OrderSummary);
    } catch {
      // Corrupt or unavailable storage falls through to the fallback.
    }
    setLoaded(true);
  }, [orderNumber]);

  if (!loaded) return null;

  const waHref = order
    ? orderWhatsappLink(order)
    : whatsappLink(
        `Assalam-o-Alaikum Sweet Bites\n\nI've placed order ${orderNumber} on the website.\n\nSent from sweetbites.pk`
      );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="eyebrow text-pista">Order received</span>
        <h1 className="text-xl text-ink md:text-2xl">Thank you{order ? `, ${order.customerName}` : ""}</h1>
        <p className="text-base text-ink/70">
          Your order number is
        </p>
        <p className="font-display text-2xl text-ink">{orderNumber}</p>
      </div>

      {/* The single most important element on this page (§7 step 7). */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-6 text-base font-medium text-[#04301A] transition-colors hover:bg-whatsapp/90"
      >
        <WhatsAppIcon />
        Send order on WhatsApp
      </a>

      <p className="-mt-2 text-sm text-ink/70">
        Your order is saved, but it isn&apos;t confirmed until we reply. Sending it on WhatsApp is
        the fastest way to get that confirmation - the whole message is already written for you.
      </p>

      {order ? (
        <>
          {order.advanceRequired ? (
            <div className="rounded-lg border border-ghee/40 bg-ghee/10 p-4">
              <p className="text-base font-medium text-ink">
                First order - full advance payment required
              </p>
              <p className="mt-1 text-sm text-ink/75">
                Send {formatPrice(order.total)} using the details we showed at checkout, then share
                the screenshot on WhatsApp. We&apos;ll start baking as soon as it clears.
              </p>
            </div>
          ) : null}

          <div className="rounded-lg border border-cream-200 bg-cream-50 p-5">
            <h2 className="mb-4 text-lg text-ink">Your order</h2>

            <ul className="flex flex-col divide-y divide-cream-200 border-y border-cream-200">
              {order.items.map((item, index) => (
                <li key={`${item.name}-${index}`} className="flex justify-between gap-4 py-3">
                  <div>
                    <p className="text-base text-ink">
                      {item.name}
                      {item.qty > 1 ? ` ×${item.qty}` : ""}
                    </p>
                    <p className="text-sm text-ink/60">
                      {[item.sizeLabel, item.flavor].filter(Boolean).join(" · ")}
                    </p>
                    {item.cakeMessage ? (
                      <p className="text-sm text-ink/60">“{item.cakeMessage}”</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-base text-ghee">{formatPrice(item.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.deliveryFee > 0 ? (
                <Row label="Delivery charge" value={formatPrice(order.deliveryFee)} />
              ) : order.fulfillment === "delivery" ? (
                <Row label="Delivery" value="Free" />
              ) : null}
              {order.lateNightFee > 0 ? (
                <Row
                  label="Late-night charge (after 10 PM)"
                  value={formatPrice(order.lateNightFee)}
                />
              ) : null}
              <div className="mt-1 flex justify-between border-t border-cream-200 pt-2">
                <dt className="text-base text-ink">Total</dt>
                <dd className="text-base font-medium text-ghee">{formatPrice(order.total)}</dd>
              </div>
            </dl>

            <dl className="mt-5 flex flex-col gap-2 border-t border-cream-200 pt-4 text-sm">
              <Row label="Ready on" value={formatChosenDate(order.requiredDate)} />
              <Row
                label="Time"
                value={TIME_SLOT_LABELS[order.timeSlot] ?? order.timeSlot}
              />
              <Row
                label="Collection"
                value={
                  order.fulfillment === "pickup"
                    ? "Pickup from the shop"
                    : `Delivery - ${order.deliveryAreaName ?? "Arifwala"}`
                }
              />
              {order.address ? <Row label="Address" value={order.address} /> : null}
              <Row
                label="Payment"
                value={PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
              />
              {order.occasion && order.occasion !== "none" ? (
                <Row
                  label="Occasion"
                  value={`${OCCASION_LABELS[order.occasion] ?? order.occasion}${
                    order.occasionPerson ? ` - ${order.occasionPerson}` : ""
                  }`}
                />
              ) : null}
            </dl>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-cream-200 bg-cream-100 p-5">
          <p className="text-base text-ink">
            We have your order safely, but the full summary isn&apos;t available on this device.
          </p>
          <p className="mt-1 text-sm text-ink/70">
            Send us the order number on WhatsApp and we&apos;ll read it back to you.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-cream-200 pt-5 text-sm text-ink/70">
        <p>
          Questions? Call or WhatsApp{" "}
          <a href={`tel:${BUSINESS.phoneE164}`} className="text-rosewood underline underline-offset-4">
            {BUSINESS.phoneDisplay}
          </a>
          , any day between 8:00 AM and 10:00 PM.
        </p>
        <Link href="/gallery" className="text-rosewood underline underline-offset-4">
          Back to the gallery
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
