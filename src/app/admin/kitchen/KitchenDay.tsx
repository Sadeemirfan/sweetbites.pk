"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { addDays, fromISODate, toISODate, today } from "@/lib/availability";
import { TIME_SLOTS } from "@/lib/admin/constants";
import { cn } from "@/lib/utils/cn";

export type KitchenItem = {
  id: string;
  name_snapshot: string | null;
  size_label: string | null;
  flavor: string | null;
  qty: number;
  cake_message: string | null;
  weight_kg: number | null;
};

export type KitchenOrder = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  phone: string;
  time_slot: string | null;
  fulfillment: string | null;
  address: string | null;
  admin_note: string | null;
  customer_note: string | null;
  occasion: string | null;
  occasion_person: string | null;
  delivery_areas: { name: string } | null;
  order_items: KitchenItem[];
};

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * §12 - the most valuable screen, and the printed sheet is the point of
 * it: "phones are awkward in a kitchen, so the printed sheet has to be
 * genuinely good."
 *
 * Screen and paper share one DOM rather than duplicating markup. The
 * print rules in globals.css enlarge the type, drop the chrome, and stop
 * a cake's instructions splitting across a page break - so what is
 * printed can never drift out of sync with what is on screen.
 */
export function KitchenDay({ dateIso, orders }: { dateIso: string; orders: KitchenOrder[] }) {
  const router = useRouter();
  const date = fromISODate(dateIso);

  function go(nextIso: string) {
    router.push(`/admin/kitchen?date=${nextIso}`);
  }

  const grouped = TIME_SLOTS.map((slot) => ({
    slot,
    orders: orders.filter((order) => order.time_slot === slot.value),
  })).filter((group) => group.orders.length > 0);

  const unslotted = orders.filter(
    (order) => !TIME_SLOTS.some((slot) => slot.value === order.time_slot)
  );
  if (unslotted.length) {
    grouped.push({
      slot: { value: "none", label: "No time slot", short: "-" },
      orders: unslotted,
    });
  }

  const totalCakes = orders.reduce(
    (sum, order) => sum + order.order_items.reduce((n, item) => n + item.qty, 0),
    0
  );

  return (
    <div>
      <div className="no-print mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => go(toISODate(addDays(date, -1)))}
          aria-label="Previous day"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 bg-cream-50 text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <input
          type="date"
          value={dateIso}
          onChange={(event) => event.target.value && go(event.target.value)}
          className="h-11 min-w-0 flex-1 rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink sm:flex-none"
        />

        <button
          type="button"
          onClick={() => go(toISODate(addDays(date, 1)))}
          aria-label="Next day"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 bg-cream-50 text-ink"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => go(toISODate(today()))}
          className="h-11 rounded-md border border-cream-200 bg-cream-50 px-3 text-sm text-ink"
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          disabled={orders.length === 0}
          className="ml-auto flex h-11 items-center gap-2 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50 disabled:opacity-45"
        >
          <Printer className="h-4 w-4" />
          Print sheet
        </button>
      </div>

      <div className="print-sheet">
        <header className="mb-4 border-b border-cream-200 pb-3">
          <h2 className="text-lg font-medium text-ink print:text-2xl">
            Baking sheet - {LONG_DATE.format(date)}
          </h2>
          <p className="mt-0.5 text-sm text-ink/60 print:text-base">
            {orders.length} {orders.length === 1 ? "order" : "orders"} · {totalCakes}{" "}
            {totalCakes === 1 ? "item" : "items"}
          </p>
        </header>

        {grouped.length === 0 ? (
          <p className="text-sm text-ink/60">Nothing due on this date.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map((group) => (
              <section key={group.slot.value} className="print-slot">
                <h3 className="mb-2 border-b border-cream-200 pb-1 text-sm font-medium uppercase tracking-wide text-rosewood print:text-lg print:text-black">
                  {group.slot.label} · {group.orders.length}
                </h3>

                <ul className="flex flex-col gap-3">
                  {group.orders.map((order) => (
                    <li
                      key={order.id}
                      className="print-item rounded-md border border-cream-200 bg-cream-50 p-3 print:border-black print:p-2"
                    >
                      <div className="flex items-start gap-3">
                        {/* Real checkbox so the sheet works as a checklist
                            on paper, and can be ticked on screen too. */}
                        <span
                          className="mt-0.5 flex h-6 w-6 shrink-0 rounded-sm border-2 border-ink/30 print:h-7 print:w-7 print:border-black"
                          aria-hidden="true"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="text-base font-medium text-ink print:text-lg">
                              {order.customer_name || "Customer"}
                            </span>
                            <a
                              href={`tel:${order.phone}`}
                              className="text-sm text-ink/70 print:text-base"
                            >
                              {order.phone}
                            </a>
                            <span className="text-xs text-ink/50 print:text-sm">
                              {order.order_number}
                            </span>
                          </div>

                          <ul className="mt-2 flex flex-col gap-1.5">
                            {order.order_items.map((item) => (
                              <li key={item.id} className="text-sm text-ink print:text-base">
                                <span className="font-medium">
                                  {item.qty > 1 ? `${item.qty} × ` : ""}
                                  {item.name_snapshot}
                                </span>
                                {item.size_label || item.flavor ? (
                                  <span className="text-ink/75">
                                    {" - "}
                                    {[item.size_label, item.flavor].filter(Boolean).join(" · ")}
                                  </span>
                                ) : null}
                                {item.cake_message ? (
                                  <span className="mt-0.5 block rounded-sm bg-cream-100 px-2 py-1 text-sm text-ink print:bg-transparent print:px-0 print:text-base print:font-medium">
                                    Write on cake: “{item.cake_message}”
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/70 print:text-sm">
                            <span
                              className={cn(
                                "rounded-sm px-1.5 py-0.5",
                                order.fulfillment === "delivery"
                                  ? "bg-status-delivery/15 text-status-delivery"
                                  : "bg-cream-200 text-ink/75",
                                "print:bg-transparent print:px-0 print:text-black"
                              )}
                            >
                              {order.fulfillment === "delivery"
                                ? `Delivery - ${order.delivery_areas?.name ?? "Arifwala"}`
                                : "Pickup"}
                            </span>
                            {order.occasion && order.occasion !== "none" ? (
                              <span>
                                {order.occasion}
                                {order.occasion_person ? ` - ${order.occasion_person}` : ""}
                              </span>
                            ) : null}
                          </div>

                          {order.fulfillment === "delivery" && order.address ? (
                            <p className="mt-1 text-xs text-ink/70 print:text-sm">
                              {order.address}
                            </p>
                          ) : null}

                          {order.customer_note ? (
                            <p className="mt-1 text-xs text-ink/70 print:text-sm">
                              Customer note: {order.customer_note}
                            </p>
                          ) : null}
                          {order.admin_note ? (
                            <p className="mt-1 text-xs text-ink/70 print:text-sm">
                              Note: {order.admin_note}
                            </p>
                          ) : null}

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="no-print mt-2 inline-block text-xs text-rosewood hover:underline"
                          >
                            Open order
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
