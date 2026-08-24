"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, TriangleAlert } from "lucide-react";
import {
  OCCASIONS,
  ORDER_SOURCES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  TIME_SLOTS,
} from "@/lib/admin/constants";
import { createManualOrder, type ManualItemInput } from "@/app/admin/orders/new/actions";
import { findCustomer } from "@/app/admin/actions";
import { earliestDate, toISODate } from "@/lib/availability";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ProductOption = {
  id: string;
  name: string;
  basePrice: number | null;
  leadTimeDays: number;
  sizes: { label: string; weight_kg: number | null; price: number }[];
  flavors: string[];
};

type AreaOption = { id: string; name: string; fee: number; isInsideCity: boolean };

type Line = ManualItemInput & { key: string };

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";
const label = "mb-1 block text-xs font-medium uppercase tracking-wide text-ink/60";

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/**
 * §13.1 - manual order entry. Design priority is speed: this gets used
 * while a customer waits on WhatsApp, target under 60 seconds, one
 * thumb, on a phone.
 *
 * Everything is on one screen rather than stepped, because steps cost
 * taps and the baker already knows the whole order - she is transcribing
 * it, not being guided through it. Source is first and phone is second,
 * exactly as the plan orders them, because the phone is what fills in
 * the rest of the form.
 */
export function ManualOrderForm({
  products,
  areas,
  lateNightFee,
  todayIso,
}: {
  products: ProductOption[];
  areas: AreaOption[];
  lateNightFee: number;
  todayIso: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [source, setSource] = useState("whatsapp");
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [history, setHistory] = useState<{ totalOrders: number; last: string | null } | null>(
    null
  );
  const [isReturning, setIsReturning] = useState<boolean | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [lines, setLines] = useState<Line[]>([]);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("delivery");
  const [areaId, setAreaId] = useState<string>("");
  const [feeOverride, setFeeOverride] = useState<string>("");
  const [address, setAddress] = useState("");
  const [requiredDate, setRequiredDate] = useState(todayIso);
  const [timeSlot, setTimeSlot] = useState<string>("4-7");
  const [occasion, setOccasion] = useState("none");
  const [occasionPerson, setOccasionPerson] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [advancePaid, setAdvancePaid] = useState("");
  const [discount, setDiscount] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const selectedArea = areas.find((area) => area.id === areaId) ?? null;
  const areaFee =
    fulfillment === "delivery"
      ? feeOverride !== ""
        ? Number(feeOverride) || 0
        : (selectedArea?.fee ?? 0)
      : 0;
  const appliedLateFee = timeSlot === "after-10" ? lateNightFee : 0;

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const total = subtotal + areaFee + appliedLateFee - (Number(discount) || 0);

  /**
   * Soft warning only (§13.1). The website's 2-day promise is a promise
   * to customers, not a constraint on the owner - so this never disables
   * the save button.
   */
  const leadWarning = useMemo(() => {
    if (!requiredDate || !lines.length) return null;
    const maxLead = Math.max(
      ...lines.map((line) => {
        const product = products.find((p) => p.id === line.productId);
        return product?.leadTimeDays ?? 2;
      })
    );
    const floor = toISODate(earliestDate(maxLead));
    return requiredDate < floor
      ? `That's inside the usual ${maxLead}-day lead time (earliest would be ${floor}). Saving anyway.`
      : null;
  }, [requiredDate, lines, products]);

  async function onPhoneBlur() {
    if (phone.replace(/\D/g, "").length < 11) return;
    setLookingUp(true);
    const found = await findCustomer(phone);
    setLookingUp(false);

    if (found) {
      setIsReturning(true);
      setHistory({ totalOrders: found.totalOrders, last: found.lastOrderDate });
      // Auto-fill, but never clobber something already typed.
      setCustomerName((current) => current || found.name || "");
      setWhatsapp((current) => current || found.whatsapp || "");
      setAddress((current) => current || found.address || "");
      if (found.areaId) setAreaId((current) => current || found.areaId!);
    } else {
      setIsReturning(false);
      setHistory(null);
    }
  }

  function addCatalogueLine(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const size = product.sizes[0] ?? null;

    setLines((current) => [
      ...current,
      {
        key: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        sizeLabel: size?.label ?? null,
        flavor: product.flavors[0] ?? null,
        unitPrice: size?.price ?? product.basePrice ?? 0,
        qty: 1,
        cakeMessage: null,
      },
    ]);
  }

  function addFreeTextLine() {
    setLines((current) => [
      ...current,
      {
        key: crypto.randomUUID(),
        productId: null,
        name: "",
        sizeLabel: null,
        flavor: null,
        unitPrice: 0,
        qty: 1,
        cakeMessage: null,
      },
    ]);
  }

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await createManualOrder({
        source,
        phone,
        customerName,
        whatsapp: whatsapp || null,
        fulfillment,
        deliveryAreaId: fulfillment === "delivery" ? areaId || null : null,
        address: fulfillment === "delivery" ? address || null : null,
        deliveryFee: areaFee,
        lateNightFee: appliedLateFee,
        requiredDate,
        timeSlot,
        // `key` is client-side only - strip it before it reaches the DB.
        items: lines.map((line) => ({
          productId: line.productId,
          name: line.name,
          sizeLabel: line.sizeLabel,
          flavor: line.flavor,
          unitPrice: line.unitPrice,
          qty: line.qty,
          cakeMessage: line.cakeMessage,
        })),
        discount: Number(discount) || 0,
        occasion: occasion === "none" ? null : occasion,
        occasionPerson: occasionPerson || null,
        paymentMethod,
        paymentStatus,
        advancePaid: Number(advancePaid) || 0,
        adminNote: adminNote || null,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(`Order ${result.orderNumber ?? ""} saved`);
      router.push(`/admin/orders/${result.orderId}`);
    });
  }

  return (
    <div className="flex flex-col gap-5 p-4 pb-32 md:p-6">
      {/* 1 - SOURCE, first (§13.1) */}
      <section>
        <span className={label}>Where did this order come from?</span>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {ORDER_SOURCES.filter((option) => option.value !== "website").map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSource(option.value)}
              aria-pressed={source === option.value}
              className={cn(
                "min-h-11 rounded-md border px-2 text-sm transition-colors",
                source === option.value
                  ? "border-rosewood bg-rosewood/10 font-medium text-ink"
                  : "border-cream-200 bg-cream-50 text-ink/75"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2 - PHONE, which drives the rest */}
      <section className="rounded-md border border-cream-200 bg-cream-100 p-3">
        <label className={label} htmlFor="phone">
          Customer phone
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          onBlur={onPhoneBlur}
          placeholder="0321 7337801"
          className={field}
        />

        {lookingUp ? (
          <p className="mt-2 text-sm text-ink/60">Looking up…</p>
        ) : isReturning && history ? (
          <p className="mt-2 text-sm text-ink">
            <span className="font-medium">{history.totalOrders}</span> previous{" "}
            {history.totalOrders === 1 ? "order" : "orders"}
            {history.last ? `, last on ${history.last}` : ""}. Details filled in below.
          </p>
        ) : isReturning === false ? (
          <p className="mt-2 inline-flex items-center rounded-sm bg-rosewood/15 px-2 py-0.5 text-sm font-medium text-rosewood-d">
            First order for this number
          </p>
        ) : null}

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="customer_name">
              Name
            </label>
            <input
              id="customer_name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="whatsapp">
              WhatsApp (if different)
            </label>
            <input
              id="whatsapp"
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              className={field}
            />
          </div>
        </div>
      </section>

      {/* 3 - ITEMS, catalogue or free text */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className={cn(label, "mb-0")}>Items</span>
          <span className="text-sm text-ink/60">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex flex-col gap-2">
          {lines.map((line) => {
            const product = line.productId
              ? products.find((p) => p.id === line.productId)
              : null;

            return (
              <div
                key={line.key}
                className="rounded-md border border-cream-200 bg-cream-50 p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    {product ? (
                      <p className="text-sm font-medium text-ink">{product.name}</p>
                    ) : (
                      <input
                        value={line.name}
                        onChange={(event) => updateLine(line.key, { name: event.target.value })}
                        placeholder="What is it? e.g. 3 Pound photo cake"
                        className={field}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLines((current) => current.filter((item) => item.key !== line.key))
                    }
                    aria-label="Remove item"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink/50 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {product ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {product.sizes.length ? (
                      <select
                        value={line.sizeLabel ?? ""}
                        onChange={(event) => {
                          const size = product.sizes.find(
                            (option) => option.label === event.target.value
                          );
                          updateLine(line.key, {
                            sizeLabel: size?.label ?? null,
                            unitPrice: size?.price ?? line.unitPrice,
                          });
                        }}
                        className={field}
                      >
                        {product.sizes.map((size) => (
                          <option key={size.label} value={size.label}>
                            {size.label} - {formatPrice(size.price)}
                          </option>
                        ))}
                      </select>
                    ) : null}

                    {product.flavors.length ? (
                      <select
                        value={line.flavor ?? ""}
                        onChange={(event) =>
                          updateLine(line.key, { flavor: event.target.value || null })
                        }
                        className={field}
                      >
                        {product.flavors.map((flavor) => (
                          <option key={flavor} value={flavor}>
                            {flavor}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div>
                    <label className={label}>Price</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={line.unitPrice || ""}
                      onChange={(event) =>
                        updateLine(line.key, { unitPrice: Number(event.target.value) || 0 })
                      }
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label}>Qty</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={line.qty}
                      onChange={(event) =>
                        updateLine(line.key, { qty: Math.max(1, Number(event.target.value) || 1) })
                      }
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label}>Line</label>
                    <div className="flex h-11 items-center px-1 text-sm text-ghee">
                      {formatPrice(line.unitPrice * line.qty)}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <label className={label}>Message on cake</label>
                  <input
                    value={line.cakeMessage ?? ""}
                    onChange={(event) =>
                      updateLine(line.key, { cakeMessage: event.target.value || null })
                    }
                    placeholder="Happy Birthday Ayesha"
                    className={field}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <select
            value=""
            onChange={(event) => event.target.value && addCatalogueLine(event.target.value)}
            className={field}
          >
            <option value="">+ Add from catalogue</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          {/* §13.1: free-text items are essential - real orders often
              don't match the catalogue, and forcing them to would make
              the baker avoid this form entirely. */}
          <button
            type="button"
            onClick={addFreeTextLine}
            className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-dashed border-cream-200 bg-cream-50 px-3 text-sm text-ink"
          >
            <Plus className="h-4 w-4" />
            Add anything else
          </button>
        </div>
      </section>

      {/* 4 - WHEN */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="required_date">
            Needed on
          </label>
          <input
            id="required_date"
            type="date"
            value={requiredDate}
            onChange={(event) => setRequiredDate(event.target.value)}
            className={field}
          />
          <p className="mt-1 text-xs text-ink/55">{LONG_DATE.format(new Date(requiredDate))}</p>
        </div>
        <div>
          <label className={label} htmlFor="time_slot">
            Time slot
          </label>
          <select
            id="time_slot"
            value={timeSlot}
            onChange={(event) => setTimeSlot(event.target.value)}
            className={field}
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
                {slot.value === "after-10" ? ` (+${formatPrice(lateNightFee)})` : ""}
              </option>
            ))}
          </select>
        </div>

        {leadWarning ? (
          <p className="flex items-start gap-2 rounded-md border border-status-baking/40 bg-status-baking/10 p-2.5 text-sm text-ink sm:col-span-2">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-status-baking" />
            {leadWarning}
          </p>
        ) : null}
      </section>

      {/* 5 - HOW IT GOES OUT */}
      <section>
        <span className={label}>Pickup or delivery</span>
        <div className="grid grid-cols-2 gap-2">
          {(["delivery", "pickup"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFulfillment(option)}
              aria-pressed={fulfillment === option}
              className={cn(
                "min-h-11 rounded-md border text-sm capitalize transition-colors",
                fulfillment === option
                  ? "border-rosewood bg-rosewood/10 font-medium text-ink"
                  : "border-cream-200 bg-cream-50 text-ink/75"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {fulfillment === "delivery" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="area">
                Area
              </label>
              <select
                id="area"
                value={areaId}
                onChange={(event) => {
                  setAreaId(event.target.value);
                  setFeeOverride("");
                }}
                className={field}
              >
                <option value="">Choose area</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} - {area.fee === 0 ? "Free" : formatPrice(area.fee)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="fee">
                Delivery fee (override)
              </label>
              <input
                id="fee"
                type="number"
                inputMode="numeric"
                value={feeOverride}
                onChange={(event) => setFeeOverride(event.target.value)}
                placeholder={String(selectedArea?.fee ?? 0)}
                className={field}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                rows={2}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="w-full rounded-md border border-cream-200 bg-cream-50 p-3 text-base text-ink outline-none focus:border-rosewood"
              />
            </div>
          </div>
        ) : null}
      </section>

      {/* 6 - OCCASION (optional, feeds §13.4 next year) */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="occasion">
            Occasion
          </label>
          <select
            id="occasion"
            value={occasion}
            onChange={(event) => setOccasion(event.target.value)}
            className={field}
          >
            {OCCASIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {occasion !== "none" ? (
          <div>
            <label className={label} htmlFor="occasion_person">
              Who for?
            </label>
            <input
              id="occasion_person"
              value={occasionPerson}
              onChange={(event) => setOccasionPerson(event.target.value)}
              placeholder="Ayesha"
              className={field}
            />
          </div>
        ) : null}
      </section>

      {/* 7 - MONEY */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="payment_method">
            Payment method
          </label>
          <select
            id="payment_method"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className={field}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="payment_status">
            Payment status
          </label>
          <select
            id="payment_status"
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            className={field}
          >
            {PAYMENT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
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
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="discount">
            Discount
          </label>
          <input
            id="discount"
            type="number"
            inputMode="numeric"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            className={field}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="admin_note">
            Note to self
          </label>
          <input
            id="admin_note"
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder="Less sugar, deliver to back gate…"
            className={field}
          />
        </div>
      </section>

      {/* Sticky save - the total and the action stay reachable with one
          thumb no matter how long the form gets. */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-cream-200 bg-cream-100 p-3 lg:bottom-0 lg:left-56">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-ink/60">Total</p>
            <p className="text-lg font-medium leading-none text-ghee">{formatPrice(total)}</p>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={pending || lines.length === 0}
            className="ml-auto flex min-h-12 flex-1 items-center justify-center rounded-md bg-rosewood px-5 text-base font-medium text-cream-50 disabled:opacity-45 sm:flex-none"
          >
            {pending ? "Saving…" : "Save order"}
          </button>
        </div>
      </div>
    </div>
  );
}
