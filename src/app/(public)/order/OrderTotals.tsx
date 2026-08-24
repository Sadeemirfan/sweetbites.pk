"use client";

import { formatPrice } from "@/lib/utils/format";

/**
 * §7 step 3: the area fee and the late-night fee are shown as separate
 * lines, and the total updates live as choices change - the customer
 * should never meet a charge for the first time at the total.
 */
export function OrderTotals({
  subtotal,
  deliveryFee,
  lateNightFee,
  isInsideCityFree,
}: {
  subtotal: number;
  deliveryFee: number;
  lateNightFee: number;
  isInsideCityFree: boolean;
}) {
  const total = subtotal + deliveryFee + lateNightFee;

  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink/70">Subtotal</dt>
        <dd className="text-ink">{formatPrice(subtotal)}</dd>
      </div>

      {isInsideCityFree ? (
        <div className="flex justify-between">
          <dt className="text-ink/70">Delivery</dt>
          <dd className="text-pista">Free</dd>
        </div>
      ) : deliveryFee > 0 ? (
        <div className="flex justify-between">
          <dt className="text-ink/70">Delivery charge</dt>
          <dd className="text-ink">{formatPrice(deliveryFee)}</dd>
        </div>
      ) : null}

      {lateNightFee > 0 ? (
        <div className="flex justify-between">
          <dt className="text-ink/70">Late-night charge (after 10 PM)</dt>
          <dd className="text-ink">{formatPrice(lateNightFee)}</dd>
        </div>
      ) : null}

      <div className="mt-1 flex justify-between border-t border-cream-200 pt-2">
        <dt className="text-base text-ink">Total</dt>
        <dd className="text-base font-medium text-ghee">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
