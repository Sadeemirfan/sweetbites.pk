"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, MessageCircle, Printer } from "lucide-react";
import { moveOrderStatus, updateOrderFields } from "@/app/admin/actions";
import { privateFileUrl } from "@/lib/admin/private-file";
import {
  OCCASIONS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SOURCE_LABELS,
  STATUS_LABELS,
  TIME_SLOTS,
} from "@/lib/admin/constants";
import { StatusDot } from "@/components/admin/AdminBits";
import { formatPrice } from "@/lib/utils/format";
import { whatsappLink } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils/cn";

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";
const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60";

type OrderItem = {
  id: string;
  name_snapshot: string | null;
  size_label: string | null;
  flavor: string | null;
  qty: number;
  unit_price: number | null;
  cake_message: string | null;
  reference_image_url: string | null;
};

type OrderEvent = { id: string; status: string; note: string | null; created_at: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function OrderDetail({ order }: { order: any }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<string>(order.payment_status);
  const [paymentMethod, setPaymentMethod] = useState<string>(order.payment_method ?? "cod");
  const [advancePaid, setAdvancePaid] = useState<string>(String(order.advance_paid ?? 0));
  const [occasion, setOccasion] = useState<string>(order.occasion ?? "none");
  const [occasionPerson, setOccasionPerson] = useState<string>(order.occasion_person ?? "");
  const [adminNote, setAdminNote] = useState<string>(order.admin_note ?? "");

  const items: OrderItem[] = order.order_items ?? [];
  const events: OrderEvent[] = [...(order.order_events ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const slotLabel =
    TIME_SLOTS.find((slot) => slot.value === order.time_slot)?.label ?? order.time_slot ?? "-";

  /** §12 - one tap to WhatsApp the customer, pre-addressed and pre-written. */
  const customerWa = whatsappLink(
    `Assalam-o-Alaikum${order.customer_name ? ` ${order.customer_name}` : ""},\n\n` +
      `About your order ${order.order_number} for ${order.required_date}:\n\n` +
      `- Sweet Bites Arifwala`
  ).replace(
    /wa\.me\/\d+/,
    `wa.me/92${String(order.whatsapp || order.phone).replace(/\D/g, "").replace(/^0/, "")}`
  );

  function saveField(fields: Parameters<typeof updateOrderFields>[1], message: string) {
    startTransition(async () => {
      const result = await updateOrderFields(order.id, fields);
      if (result.ok) toast.success(message);
      else toast.error(result.message);
    });
  }

  function changeStatus(next: string) {
    setStatus(next);
    startTransition(async () => {
      const result = await moveOrderStatus(order.id, next);
      if (result.ok) toast.success(`Moved to ${STATUS_LABELS[next]}`);
      else toast.error(result.message);
    });
  }

  return (
    <div className="p-4 pb-24 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Status + quick actions */}
          <section className="no-print rounded-md border border-cream-200 bg-cream-50 p-3">
            <span className={label}>Status</span>
            <div className="flex flex-wrap gap-1.5">
              {ORDER_STATUSES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={pending}
                  onClick={() => changeStatus(option.value)}
                  aria-pressed={status === option.value}
                  className={cn(
                    "flex min-h-11 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
                    status === option.value
                      ? "border-rosewood bg-rosewood/10 font-medium text-ink"
                      : "border-cream-200 bg-cream-50 text-ink/75"
                  )}
                >
                  <StatusDot status={option.value} />
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={customerWa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 rounded-md bg-whatsapp px-4 text-sm font-medium text-[#04301A]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp customer
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex min-h-11 items-center gap-2 rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink"
              >
                <Printer className="h-4 w-4" />
                Print slip
              </button>
            </div>
          </section>

          {/* The slip itself - this block is what prints. */}
          <section className="print-sheet rounded-md border border-cream-200 bg-cream-50 p-4">
            <header className="mb-3 border-b border-cream-200 pb-2">
              <h2 className="text-base font-medium text-ink print:text-xl">
                {order.order_number}
              </h2>
              <p className="text-sm text-ink/60 print:text-base">
                {order.customer_name} · {order.phone} ·{" "}
                {SOURCE_LABELS[order.source] ?? order.source}
              </p>
            </header>

            <dl className="mb-3 grid grid-cols-2 gap-2 text-sm print:text-base">
              <Row label="Needed on" value={order.required_date} />
              <Row label="Time" value={slotLabel} />
              <Row
                label="Fulfilment"
                value={
                  order.fulfillment === "delivery"
                    ? `Delivery - ${order.delivery_areas?.name ?? "Arifwala"}`
                    : "Pickup"
                }
              />
              <Row label="Payment" value={PAYMENT_STATUSES.find((s) => s.value === paymentStatus)?.label ?? paymentStatus} />
            </dl>

            {order.address ? (
              <p className="mb-3 text-sm text-ink/75 print:text-base">{order.address}</p>
            ) : null}

            <ul className="flex flex-col divide-y divide-cream-200 border-y border-cream-200">
              {items.map((item) => (
                <li key={item.id} className="print-item py-2">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink print:text-base">
                        {item.qty > 1 ? `${item.qty} × ` : ""}
                        {item.name_snapshot}
                      </p>
                      <p className="text-xs text-ink/65 print:text-sm">
                        {[item.size_label, item.flavor].filter(Boolean).join(" · ")}
                      </p>
                      {item.cake_message ? (
                        <p className="mt-1 rounded-sm bg-cream-100 px-2 py-1 text-sm text-ink print:bg-transparent print:px-0 print:font-medium">
                          Write on cake: “{item.cake_message}”
                        </p>
                      ) : null}
                      {item.reference_image_url ? (
                        <a
                          href={privateFileUrl("order-refs", item.reference_image_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-print mt-1 inline-flex min-h-9 items-center gap-1.5 text-xs text-rosewood hover:underline"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          View the picture they sent
                        </a>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm text-ghee print:text-black">
                      {formatPrice((item.unit_price ?? 0) * item.qty)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-3 flex flex-col gap-1 text-sm print:text-base">
              <Line label="Subtotal" value={formatPrice(order.subtotal)} />
              {Number(order.delivery_fee) > 0 ? (
                <Line label="Delivery" value={formatPrice(order.delivery_fee)} />
              ) : null}
              {Number(order.late_night_fee) > 0 ? (
                <Line label="Late-night charge" value={formatPrice(order.late_night_fee)} />
              ) : null}
              {Number(order.discount) > 0 ? (
                <Line label="Discount" value={`− ${formatPrice(order.discount)}`} />
              ) : null}
              <div className="mt-1 flex justify-between border-t border-cream-200 pt-1 font-medium">
                <dt className="text-ink">Total</dt>
                <dd className="text-ghee print:text-black">{formatPrice(order.total)}</dd>
              </div>
              {Number(order.advance_paid) > 0 ? (
                <Line label="Received" value={formatPrice(order.advance_paid)} />
              ) : null}
            </dl>

            {order.customer_note ? (
              <p className="mt-3 text-sm text-ink/75 print:text-base">
                Customer note: {order.customer_note}
              </p>
            ) : null}
          </section>

          {/* Payment proof - private bucket, opened through a short-lived
              signed URL rather than being served publicly. */}
          {order.payment_proof_url ? (
            <section className="no-print rounded-md border border-cream-200 bg-cream-50 p-3">
              <span className={label}>Payment proof</span>
              <a
                href={privateFileUrl("payment-proofs", order.payment_proof_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 self-start rounded-md border border-cream-200 px-3 text-sm text-rosewood hover:underline"
              >
                <ImageIcon className="h-4 w-4" />
                View the screenshot the customer sent
              </a>
            </section>
          ) : null}

          {/* Timeline */}
          <section className="no-print rounded-md border border-cream-200 bg-cream-50 p-3">
            <span className={label}>Timeline</span>
            <ol className="flex flex-col gap-2">
              {events.map((event) => (
                <li key={event.id} className="flex items-start gap-2 text-sm">
                  <StatusDot status={event.status} className="mt-1.5" />
                  <div>
                    <p className="text-ink">{STATUS_LABELS[event.status] ?? event.status}</p>
                    {event.note ? <p className="text-xs text-ink/60">{event.note}</p> : null}
                    <p className="text-xs text-ink/45">
                      {new Date(event.created_at).toLocaleString("en-GB", {
                        timeZone: "Asia/Karachi",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Editable side panel */}
        <aside className="no-print flex flex-col gap-4">
          <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
            <span className={label}>Payment</span>
            <div className="flex flex-col gap-2">
              <select
                value={paymentStatus}
                onChange={(event) => {
                  setPaymentStatus(event.target.value);
                  saveField({ payment_status: event.target.value }, "Payment status saved");
                }}
                className={field}
              >
                {PAYMENT_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={paymentMethod}
                onChange={(event) => {
                  setPaymentMethod(event.target.value);
                  saveField({ payment_method: event.target.value }, "Payment method saved");
                }}
                className={field}
              >
                {PAYMENT_METHODS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div>
                <label className={label} htmlFor="advance_paid">
                  Amount received
                </label>
                <input
                  id="advance_paid"
                  type="number"
                  inputMode="numeric"
                  value={advancePaid}
                  onChange={(event) => setAdvancePaid(event.target.value)}
                  onBlur={() =>
                    saveField({ advance_paid: Number(advancePaid) || 0 }, "Amount saved")
                  }
                  className={field}
                />
              </div>
            </div>
          </section>

          <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
            <span className={label}>Occasion</span>
            <p className="mb-2 text-xs text-ink/55">
              Feeds next year&apos;s reminders - worth filling in even after the fact.
            </p>
            <div className="flex flex-col gap-2">
              <select
                value={occasion}
                onChange={(event) => {
                  setOccasion(event.target.value);
                  saveField(
                    {
                      occasion: event.target.value === "none" ? null : event.target.value,
                      occasion_date:
                        event.target.value === "none" ? null : order.required_date,
                    },
                    "Occasion saved"
                  );
                }}
                className={field}
              >
                {OCCASIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {occasion !== "none" ? (
                <input
                  value={occasionPerson}
                  onChange={(event) => setOccasionPerson(event.target.value)}
                  onBlur={() =>
                    saveField({ occasion_person: occasionPerson || null }, "Name saved")
                  }
                  placeholder="Who is it for?"
                  className={field}
                />
              ) : null}
            </div>
          </section>

          <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
            <label className={label} htmlFor="admin_note">
              Note to self
            </label>
            <textarea
              id="admin_note"
              rows={3}
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              onBlur={() => saveField({ admin_note: adminNote || null }, "Note saved")}
              className="w-full rounded-md border border-cream-200 bg-cream-50 p-3 text-base text-ink outline-none focus:border-rosewood"
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label: rowLabel, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/50">{rowLabel}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function Line({ label: lineLabel, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink/65">{lineLabel}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
