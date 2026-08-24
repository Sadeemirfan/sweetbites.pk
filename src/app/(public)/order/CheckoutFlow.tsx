"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { DatePicker, formatChosenDate } from "@/components/ui/DatePicker";
import { OrderTotals } from "@/app/(public)/order/OrderTotals";
import { checkFirstOrder, createOrder } from "@/app/(public)/order/actions";
import { cartLeadTimes, cartSubtotal, useCart } from "@/lib/cart/store";
import { checkoutSchema, normalisePhone, type CheckoutValues } from "@/lib/order/schema";
import { firstAvailableDate, maxLeadTime, type BlackoutDate } from "@/lib/availability";
import { formatLongDate, formatPrice } from "@/lib/utils/format";
import { BUSINESS } from "@/lib/constants";
import { OCCASION_LABELS, TIME_SLOT_LABELS } from "@/lib/order/summary";
import type { PaymentDetails } from "@/lib/settings";
import { cn } from "@/lib/utils/cn";

type Area = { id: string; name: string; fee: number; isInsideCity: boolean };

const STEPS = ["Cart", "Date & time", "Fulfilment", "Contact", "Occasion", "Payment", "Confirm"];

const NORMAL_SLOTS = ["10-1", "1-4", "4-7", "7-10"] as const;

const inputClass =
  "min-h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none transition-colors focus:border-rosewood";

export function CheckoutFlow({
  areas,
  blackouts,
  closedWeekdays,
  lateNightFee,
  paymentDetails,
}: {
  areas: Area[];
  blackouts: BlackoutDate[];
  closedWeekdays: number[];
  lateNightFee: number;
  paymentDetails: PaymentDetails;
}) {
  const router = useRouter();
  const { items, hasHydrated, clear } = useCart();

  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstOrder, setFirstOrder] = useState<boolean | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const subtotal = cartSubtotal(items);
  const leadTime = maxLeadTime(cartLeadTimes(items));

  // Recomputed per render so a cart open past midnight, or past the
  // 6 PM cutoff, quotes the right date rather than a stale one.
  const earliest = useMemo(
    () => firstAvailableDate({ leadTimeDays: leadTime, blackouts, closedWeekdays }),
    [leadTime, blackouts, closedWeekdays]
  );

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      required_date: "",
      time_slot: undefined,
      fulfillment: "delivery",
      delivery_area_id: null,
      address: "",
      customer_name: "",
      phone: "",
      whatsapp: "",
      occasion: "none",
      occasion_person: "",
      payment_method: undefined,
      customer_note: "",
    },
  });

  const values = form.watch();
  const selectedArea = areas.find((area) => area.id === values.delivery_area_id) ?? null;

  const deliveryFee =
    values.fulfillment === "delivery" && selectedArea ? selectedArea.fee : 0;
  const appliedLateFee = values.time_slot === "after-10" ? lateNightFee : 0;
  const total = subtotal + deliveryFee + appliedLateFee;

  // The first-order check runs when the customer reaches Payment, so the
  // page can state the advance rule before they choose a method.
  useEffect(() => {
    if (step !== 5) return;
    const phone = normalisePhone(values.phone ?? "");
    if (!/^03\d{9}$/.test(phone)) return;

    let cancelled = false;
    setCheckingPhone(true);
    checkFirstOrder(phone)
      .then((result) => {
        if (!cancelled) setFirstOrder(result.isFirstOrder);
      })
      .finally(() => {
        if (!cancelled) setCheckingPhone(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, values.phone]);

  // A first order must be paid in advance, so Cash on Delivery is not
  // offered - clear it if it was already chosen.
  useEffect(() => {
    if (firstOrder && values.payment_method === "cod") {
      form.setValue("payment_method", undefined as never);
    }
  }, [firstOrder, values.payment_method, form]);

  if (!hasHydrated) {
    return <p className="py-16 text-base text-ink/60">Loading your order…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex max-w-md flex-col items-start gap-5 py-10">
        <h1 className="text-xl text-ink">Your order is empty</h1>
        <p className="text-base text-ink/70">
          Add a cake from the gallery and it will appear here, ready to check out.
        </p>
        <Link
          href="/gallery"
          className="inline-flex min-h-11 items-center rounded-md bg-ghee px-5 text-sm font-medium text-cream-50"
        >
          Browse the gallery
        </Link>
      </div>
    );
  }

  /** Which fields must be valid before the customer can leave this step. */
  async function goNext() {
    const perStep: Record<number, (keyof CheckoutValues)[]> = {
      0: [],
      1: ["required_date", "time_slot"],
      2: values.fulfillment === "delivery" ? ["delivery_area_id", "address"] : ["fulfillment"],
      3: ["customer_name", "phone"],
      4: [], // occasion is optional and must never block checkout
      5: ["payment_method"],
    };

    const fields = perStep[step] ?? [];
    if (fields.length) {
      const valid = await form.trigger(fields as never);
      if (!valid) return;
    }
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  }

  async function onConfirm() {
    setSubmitError(null);
    const valid = await form.trigger();
    if (!valid) {
      setSubmitError("Some details are missing. Please check the steps above.");
      return;
    }

    setIsSubmitting(true);
    const result = await createOrder({
      checkout: form.getValues(),
      items: items.map((line) => ({
        productId: line.productId,
        sizeLabel: line.sizeLabel,
        flavor: line.flavor,
        qty: line.qty,
        cakeMessage: line.cakeMessage,
        referenceImageUrl: line.referenceImageUrl,
      })),
    });
    setIsSubmitting(false);

    if (result.status === "error") {
      setSubmitError(result.message);
      return;
    }

    // §5 gives anonymous visitors no read path to order data, so the
    // confirmation page is handed the summary rather than fetching it.
    // sessionStorage survives a reload of that tab, which a cookie-free
    // client-side hand-off otherwise would not.
    sessionStorage.setItem(
      `sweetbites-order-${result.summary.orderNumber}`,
      JSON.stringify(result.summary)
    );
    clear();
    router.push(`/order/confirmed/${result.summary.orderNumber}`);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
      <div>
        <h1 className="text-xl text-ink md:text-2xl">Checkout</h1>

        <ol className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
          {STEPS.map((label, index) => (
            <li key={label}>
              <span
                className={cn(
                  "eyebrow transition-colors",
                  index === step ? "text-rosewood" : "text-ink/35"
                )}
              >
                {index + 1}. {label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          {/* ── 1. Cart ─────────────────────────────────────────── */}
          {step === 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg text-ink">Your cakes</h2>
              <ul className="flex flex-col divide-y divide-cream-200 border-y border-cream-200">
                {items.map((line) => (
                  <li key={line.id} className="flex justify-between gap-4 py-3">
                    <div>
                      <p className="text-base text-ink">
                        {line.name}
                        {line.qty > 1 ? ` ×${line.qty}` : ""}
                      </p>
                      <p className="text-sm text-ink/60">
                        {[line.sizeLabel, line.flavor].filter(Boolean).join(" · ")}
                      </p>
                      {line.cakeMessage ? (
                        <p className="text-sm text-ink/60">“{line.cakeMessage}”</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-base text-ghee">
                      {formatPrice(line.unitPrice * line.qty)}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-ink/60">
                Need to change something?{" "}
                <button
                  type="button"
                  onClick={() => useCart.getState().open()}
                  className="text-rosewood underline underline-offset-4"
                >
                  Edit your order
                </button>
              </p>
            </section>
          ) : null}

          {/* ── 2. Date & time ──────────────────────────────────── */}
          {step === 1 ? (
            <section className="flex flex-col gap-5">
              <div className="rounded-lg border border-cream-200 bg-cream-100 p-4">
                <p className="text-base text-ink">
                  The earliest we can have your cake ready is{" "}
                  <span className="font-medium">{formatLongDate(earliest)}</span>.
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  Every cake is baked after you order it - we don&apos;t keep ready-made stock.
                </p>
              </div>

              <Controller
                control={form.control}
                name="required_date"
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-2">
                    <span className="eyebrow text-rosewood">Choose a date</span>
                    <DatePicker
                      value={field.value || null}
                      onChange={field.onChange}
                      leadTimeDays={leadTime}
                      blackouts={blackouts}
                      closedWeekdays={closedWeekdays}
                      minMonthDate={earliest}
                    />
                    {field.value ? (
                      <p className="text-sm text-ink/70">
                        Chosen: <span className="text-ink">{formatChosenDate(field.value)}</span>
                      </p>
                    ) : null}
                    {fieldState.error ? (
                      <p className="text-sm text-rosewood-d">{fieldState.error.message}</p>
                    ) : null}
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="time_slot"
                render={({ field, fieldState }) => (
                  <fieldset className="flex flex-col gap-2">
                    <legend className="eyebrow mb-1 text-rosewood">Time slot</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {NORMAL_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => field.onChange(slot)}
                          aria-pressed={field.value === slot}
                          className={cn(
                            "min-h-11 rounded-md border px-4 text-sm transition-colors",
                            field.value === slot
                              ? "border-rosewood bg-rosewood/10 text-ink"
                              : "border-cream-200 text-ink/80 hover:border-rosewood/50"
                          )}
                        >
                          {TIME_SLOT_LABELS[slot]}
                        </button>
                      ))}
                    </div>

                    {/* §7 step 3: the charge is on the label, before the
                        slot is chosen - never a surprise at the total. */}
                    <button
                      type="button"
                      onClick={() => field.onChange("after-10")}
                      aria-pressed={field.value === "after-10"}
                      className={cn(
                        "flex min-h-11 flex-col items-start justify-center rounded-md border px-4 py-2 text-left transition-colors",
                        field.value === "after-10"
                          ? "border-rosewood bg-rosewood/10 text-ink"
                          : "border-cream-200 text-ink/80 hover:border-rosewood/50"
                      )}
                    >
                      <span className="text-sm">{TIME_SLOT_LABELS["after-10"]}</span>
                      <span className="text-xs text-ghee">
                        Adds {formatPrice(lateNightFee)} late-night charge, including inside the
                        city
                      </span>
                    </button>

                    {fieldState.error ? (
                      <p className="text-sm text-rosewood-d">{fieldState.error.message}</p>
                    ) : null}
                  </fieldset>
                )}
              />
            </section>
          ) : null}

          {/* ── 3. Fulfilment ───────────────────────────────────── */}
          {step === 2 ? (
            <section className="flex flex-col gap-5">
              <Controller
                control={form.control}
                name="fulfillment"
                render={({ field }) => (
                  <fieldset className="flex flex-col gap-2">
                    <legend className="eyebrow mb-1 text-rosewood">How would you like it?</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => field.onChange("delivery")}
                        aria-pressed={field.value === "delivery"}
                        className={cn(
                          "flex min-h-11 flex-col items-start justify-center rounded-md border px-4 py-3 text-left transition-colors",
                          field.value === "delivery"
                            ? "border-rosewood bg-rosewood/10"
                            : "border-cream-200 hover:border-rosewood/50"
                        )}
                      >
                        <span className="text-sm font-medium text-ink">Delivery</span>
                        <span className="text-xs text-ink/60">Free inside Arifwala city</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange("pickup");
                          form.setValue("delivery_area_id", null);
                        }}
                        aria-pressed={field.value === "pickup"}
                        className={cn(
                          "flex min-h-11 flex-col items-start justify-center rounded-md border px-4 py-3 text-left transition-colors",
                          field.value === "pickup"
                            ? "border-rosewood bg-rosewood/10"
                            : "border-cream-200 hover:border-rosewood/50"
                        )}
                      >
                        <span className="text-sm font-medium text-ink">Pickup</span>
                        <span className="text-xs text-ink/60">Free, from the shop</span>
                      </button>
                    </div>
                  </fieldset>
                )}
              />

              {values.fulfillment === "pickup" ? (
                <div className="rounded-lg border border-cream-200 bg-cream-100 p-4">
                  <p className="eyebrow text-rosewood">Collect from</p>
                  <p className="mt-1 text-base text-ink">{BUSINESS.street}</p>
                  <p className="text-base text-ink">
                    {BUSINESS.city}, {BUSINESS.region}
                  </p>
                  <p className="mt-2 text-sm text-ink/70">{BUSINESS.hoursDisplay}</p>
                </div>
              ) : (
                <>
                  <Controller
                    control={form.control}
                    name="delivery_area_id"
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="delivery_area_id" className="eyebrow text-rosewood">
                          Delivery area
                        </label>
                        <select
                          id="delivery_area_id"
                          className={inputClass}
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(event.target.value || null)}
                        >
                          <option value="">Choose your area</option>
                          {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.name} -{" "}
                              {area.fee === 0 ? "Free delivery" : formatPrice(area.fee)}
                            </option>
                          ))}
                        </select>
                        {selectedArea ? (
                          <p className="text-sm text-ink/70">
                            {selectedArea.fee === 0 ? (
                              <span className="text-pista">
                                Free delivery inside Arifwala city.
                              </span>
                            ) : (
                              <>
                                Delivery to {selectedArea.name} adds{" "}
                                <span className="text-ghee">{formatPrice(selectedArea.fee)}</span>.
                              </>
                            )}
                          </p>
                        ) : null}
                        {fieldState.error ? (
                          <p className="text-sm text-rosewood-d">{fieldState.error.message}</p>
                        ) : null}
                      </div>
                    )}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="address" className="eyebrow text-rosewood">
                      Delivery address
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      placeholder="House / street, nearby landmark"
                      className="w-full rounded-md border border-cream-200 bg-cream-50 p-3 text-base text-ink outline-none transition-colors focus:border-rosewood"
                      {...form.register("address")}
                    />
                    {form.formState.errors.address ? (
                      <p className="text-sm text-rosewood-d">
                        {form.formState.errors.address.message}
                      </p>
                    ) : null}
                  </div>
                </>
              )}
            </section>
          ) : null}

          {/* ── 4. Contact ──────────────────────────────────────── */}
          {step === 3 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg text-ink">Where can we reach you?</h2>
              <p className="text-sm text-ink/60">
                No account and no password - we just need a name and a number.
              </p>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer_name" className="eyebrow text-rosewood">
                  Your name
                </label>
                <input
                  id="customer_name"
                  type="text"
                  className={inputClass}
                  {...form.register("customer_name")}
                />
                {form.formState.errors.customer_name ? (
                  <p className="text-sm text-rosewood-d">
                    {form.formState.errors.customer_name.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="eyebrow text-rosewood">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="0321 7337801"
                  className={inputClass}
                  {...form.register("phone")}
                />
                {form.formState.errors.phone ? (
                  <p className="text-sm text-rosewood-d">{form.formState.errors.phone.message}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="whatsapp" className="eyebrow text-rosewood">
                  WhatsApp number{" "}
                  <span className="normal-case tracking-normal text-ink/50">
                    (if different)
                  </span>
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  className={inputClass}
                  {...form.register("whatsapp")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer_note" className="eyebrow text-rosewood">
                  Anything we should know?{" "}
                  <span className="normal-case tracking-normal text-ink/50">(optional)</span>
                </label>
                <textarea
                  id="customer_note"
                  rows={3}
                  className="w-full rounded-md border border-cream-200 bg-cream-50 p-3 text-base text-ink outline-none transition-colors focus:border-rosewood"
                  {...form.register("customer_note")}
                />
              </div>
            </section>
          ) : null}

          {/* ── 5. Occasion (optional, skippable in one tap) ────── */}
          {step === 4 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg text-ink">What&apos;s this cake for?</h2>
              <p className="text-sm text-ink/60">
                Completely optional - it just helps us get the details right.
              </p>

              <Controller
                control={form.control}
                name="occasion"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["birthday", "anniversary", "wedding", "graduation", "religious", "other"] as const
                    ).map((occasion) => (
                      <button
                        key={occasion}
                        type="button"
                        onClick={() =>
                          field.onChange(field.value === occasion ? "none" : occasion)
                        }
                        aria-pressed={field.value === occasion}
                        className={cn(
                          "min-h-11 rounded-md border px-4 text-sm transition-colors",
                          field.value === occasion
                            ? "border-rosewood bg-rosewood/10 text-ink"
                            : "border-cream-200 text-ink/80 hover:border-rosewood/50"
                        )}
                      >
                        {OCCASION_LABELS[occasion]}
                      </button>
                    ))}
                  </div>
                )}
              />

              {values.occasion && values.occasion !== "none" ? (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="occasion_person" className="eyebrow text-rosewood">
                    Who is it for?{" "}
                    <span className="normal-case tracking-normal text-ink/50">(optional)</span>
                  </label>
                  <input
                    id="occasion_person"
                    type="text"
                    placeholder="Ayesha"
                    className={inputClass}
                    {...form.register("occasion_person")}
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  form.setValue("occasion", "none");
                  form.setValue("occasion_person", "");
                  setStep(5);
                }}
                className="self-start text-sm text-ink/60 underline underline-offset-4 hover:text-rosewood"
              >
                Skip this step
              </button>
            </section>
          ) : null}

          {/* ── 6. Payment ──────────────────────────────────────── */}
          {step === 5 ? (
            <section className="flex flex-col gap-5">
              <h2 className="text-lg text-ink">How would you like to pay?</h2>

              {checkingPhone ? (
                <p className="text-sm text-ink/60">Checking your number…</p>
              ) : firstOrder ? (
                <div className="rounded-lg border border-ghee/40 bg-ghee/10 p-4">
                  <p className="text-base font-medium text-ink">
                    This is your first order with us, so full advance payment is required.
                  </p>
                  <p className="mt-1 text-sm text-ink/75">
                    Every cake is made specifically for your order, and the ingredients are bought
                    for it - so we ask first-time customers to pay up front. After this, you can
                    pay on delivery whenever you like.
                  </p>

                  <dl className="mt-4 flex flex-col gap-3 text-sm">
                    {paymentDetails.jazzcash?.number ? (
                      <div>
                        <dt className="eyebrow text-rosewood">JazzCash</dt>
                        <dd className="text-ink">
                          {paymentDetails.jazzcash.number}
                          {paymentDetails.jazzcash.name ? ` - ${paymentDetails.jazzcash.name}` : ""}
                        </dd>
                      </div>
                    ) : null}
                    {paymentDetails.easypaisa?.number ? (
                      <div>
                        <dt className="eyebrow text-rosewood">Easypaisa</dt>
                        <dd className="text-ink">
                          {paymentDetails.easypaisa.number}
                          {paymentDetails.easypaisa.name
                            ? ` - ${paymentDetails.easypaisa.name}`
                            : ""}
                        </dd>
                      </div>
                    ) : null}
                    {paymentDetails.bank?.account_number ? (
                      <div>
                        <dt className="eyebrow text-rosewood">Bank transfer</dt>
                        <dd className="text-ink">
                          {paymentDetails.bank.bank_name} - {paymentDetails.bank.account_title}
                          <br />
                          {paymentDetails.bank.account_number}
                          {paymentDetails.bank.iban ? (
                            <>
                              <br />
                              IBAN: {paymentDetails.bank.iban}
                            </>
                          ) : null}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ) : firstOrder === false ? (
                <p className="text-sm text-ink/70">
                  Welcome back - you can pay in advance or on delivery, whichever suits you.
                </p>
              ) : null}

              <Controller
                control={form.control}
                name="payment_method"
                render={({ field, fieldState }) => (
                  <fieldset className="flex flex-col gap-2">
                    <legend className="eyebrow mb-1 text-rosewood">Payment method</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(
                        [
                          ["jazzcash", "JazzCash"],
                          ["easypaisa", "Easypaisa"],
                          ["bank", "Bank transfer"],
                          ["cod", "Cash on Delivery"],
                        ] as const
                      ).map(([method, label]) => {
                        const blocked = method === "cod" && firstOrder === true;
                        return (
                          <button
                            key={method}
                            type="button"
                            disabled={blocked}
                            onClick={() => field.onChange(method)}
                            aria-pressed={field.value === method}
                            className={cn(
                              "flex min-h-11 flex-col items-start justify-center rounded-md border px-4 py-2 text-left text-sm transition-colors",
                              field.value === method
                                ? "border-rosewood bg-rosewood/10 text-ink"
                                : "border-cream-200 text-ink/80 hover:border-rosewood/50",
                              blocked && "cursor-not-allowed opacity-45 hover:border-cream-200"
                            )}
                          >
                            {label}
                            {blocked ? (
                              <span className="text-xs text-ink/60">
                                Not available on a first order
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                    {fieldState.error ? (
                      <p className="text-sm text-rosewood-d">{fieldState.error.message}</p>
                    ) : null}
                  </fieldset>
                )}
              />

              {firstOrder ? <PaymentProofUpload form={form} /> : null}
            </section>
          ) : null}

          {/* ── 7. Confirm ──────────────────────────────────────── */}
          {step === 6 ? (
            <section className="flex flex-col gap-5">
              <h2 className="text-lg text-ink">Check everything over</h2>

              <dl className="flex flex-col gap-3 rounded-lg border border-cream-200 bg-cream-100 p-4 text-sm">
                <Row label="Date" value={formatChosenDate(values.required_date)} />
                <Row
                  label="Time"
                  value={TIME_SLOT_LABELS[values.time_slot ?? ""] ?? "-"}
                />
                <Row
                  label="Collection"
                  value={
                    values.fulfillment === "pickup"
                      ? "Pickup from the shop"
                      : `Delivery - ${selectedArea?.name ?? "-"}`
                  }
                />
                {values.fulfillment === "delivery" && values.address ? (
                  <Row label="Address" value={values.address} />
                ) : null}
                <Row label="Name" value={values.customer_name ?? ""} />
                <Row label="Phone" value={normalisePhone(values.phone ?? "")} />
                {values.occasion && values.occasion !== "none" ? (
                  <Row
                    label="Occasion"
                    value={`${OCCASION_LABELS[values.occasion]}${
                      values.occasion_person ? ` - ${values.occasion_person}` : ""
                    }`}
                  />
                ) : null}
              </dl>

              {submitError ? (
                <p role="status" className="text-sm text-rosewood-d">
                  {submitError}
                </p>
              ) : null}

              <Button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="min-h-12 w-full text-base sm:w-auto"
              >
                {isSubmitting ? "Placing your order…" : `Place order - ${formatPrice(total)}`}
              </Button>
            </section>
          ) : null}
        </div>

        <div className="mt-8 flex items-center gap-3 border-t border-cream-200 pt-5">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="ml-auto">
              Next
            </Button>
          ) : null}
        </div>
      </div>

      {/* Live total, visible at every step */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-cream-200 bg-cream-50 p-5 shadow-cream">
          <h2 className="mb-4 text-base font-medium text-ink">Order total</h2>
          <OrderTotals
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            lateNightFee={appliedLateFee}
            isInsideCityFree={
              values.fulfillment === "delivery" && selectedArea?.fee === 0
            }
          />
        </div>
      </aside>
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

/**
 * Optional proof upload for first orders (§7 step 6). Goes to the
 * private `payment-proofs` bucket through a server route - that bucket
 * is admin-read/admin-write, so the browser cannot upload to it
 * directly with the anon key.
 */
function PaymentProofUpload({
  form,
}: {
  form: ReturnType<typeof useForm<CheckoutValues>>;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      return;
    }

    setStatus("uploading");
    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/payment-proof", { method: "POST", body });
      if (!response.ok) throw new Error("upload failed");
      const { path } = (await response.json()) as { path: string };
      form.setValue("payment_proof_url", path);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="payment-proof" className="eyebrow text-rosewood">
        Payment screenshot{" "}
        <span className="normal-case tracking-normal text-ink/50">(optional)</span>
      </label>
      <input
        id="payment-proof"
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="min-h-11 w-full rounded-md border border-dashed border-cream-200 bg-cream-50 p-2.5 text-sm text-ink/80 file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-cream-200 file:px-3 file:text-sm file:text-ink"
      />
      {status === "uploading" ? <p className="text-sm text-ink/60">Uploading…</p> : null}
      {status === "done" ? (
        <p className="text-sm text-pista">Screenshot attached - thank you.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-rosewood-d">
          That didn&apos;t upload. You can send it on WhatsApp instead.
        </p>
      ) : null}
    </div>
  );
}
