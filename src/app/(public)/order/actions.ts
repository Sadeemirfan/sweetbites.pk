"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderSchema, normalisePhone, type CreateOrderInput } from "@/lib/order/schema";
import { checkDate, fromISODate, maxLeadTime } from "@/lib/availability";
import { getSettings, readLateNightFee } from "@/lib/settings";
import type { OrderSummary, OrderSummaryItem } from "@/lib/order/summary";
import type { ProductSize } from "@/types/catalogue";

/**
 * Is this phone number ordering for the first time? Drives the advance
 * payment rule (§0, §7 step 6).
 *
 * Runs through the service-role client rather than a public RPC so that
 * "has this number ordered from Sweet Bites before?" is not answerable
 * by anyone holding the anon key.
 *
 * This is for the UI only. The authoritative value is set by the
 * customer-upsert trigger inside the same INSERT that creates the order,
 * so two simultaneous first orders can't both be treated as returning.
 */
export async function checkFirstOrder(rawPhone: string): Promise<{ isFirstOrder: boolean }> {
  const phone = normalisePhone(rawPhone);
  if (!/^03\d{9}$/.test(phone)) return { isFirstOrder: true };

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  return { isFirstOrder: !data };
}

export type CreateOrderResult =
  | { status: "success"; summary: OrderSummary }
  | { status: "error"; message: string };

function parseSizes(value: unknown): ProductSize[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const record = entry as Record<string, unknown>;
    const label = typeof record.label === "string" ? record.label : null;
    const price = typeof record.price === "number" ? record.price : null;
    if (!label || price === null) return [];
    return [
      { label, price, weight_kg: typeof record.weight_kg === "number" ? record.weight_kg : null },
    ];
  });
}

/**
 * Creates the order. Everything the client sent about money and dates is
 * treated as a suggestion and recomputed here (§8 rules 6 and 7).
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { checkout, items } = parsed.data;
  const supabase = createAdminClient();

  // ── Prices come from the database, never from the client ──────────
  const productIds = [...new Set(items.map((item) => item.productId))];
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name, base_price, sizes, lead_time_days, is_active")
    .in("id", productIds);

  if (productError || !products?.length) {
    return { status: "error", message: "We couldn't price that order. Please try again." };
  }

  const productById = new Map(products.map((product) => [product.id, product]));

  const pricedItems: (OrderSummaryItem & {
    productId: string;
    weightKg: number | null;
    referenceImageUrl: string | null;
  })[] = [];

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || !product.is_active) {
      return {
        status: "error",
        message: "One of the cakes in your order is no longer available. Please review your cart.",
      };
    }

    const sizes = parseSizes(product.sizes);
    const size = item.sizeLabel ? sizes.find((entry) => entry.label === item.sizeLabel) : null;

    if (item.sizeLabel && !size) {
      return {
        status: "error",
        message: "A size in your cart is no longer offered. Please review your cart.",
      };
    }

    const unitPrice = size?.price ?? product.base_price;
    if (unitPrice == null) {
      return { status: "error", message: "We couldn't price that order. Please try again." };
    }

    pricedItems.push({
      productId: product.id,
      name: product.name,
      sizeLabel: size?.label ?? null,
      weightKg: size?.weight_kg ?? null,
      flavor: item.flavor,
      qty: item.qty,
      unitPrice,
      lineTotal: unitPrice * item.qty,
      cakeMessage: item.cakeMessage?.trim() || null,
      referenceImageUrl: item.referenceImageUrl ?? null,
    });
  }

  // ── Re-validate the date against the real lead times ──────────────
  const leadTime = maxLeadTime(
    items.map((item) => productById.get(item.productId)?.lead_time_days ?? 2)
  );

  const [{ data: blackouts }, { data: rules }] = await Promise.all([
    supabase.from("blackout_dates").select("date, reason"),
    supabase.from("availability_rules").select("weekday, is_open"),
  ]);

  const closedWeekdays = (rules ?? [])
    .filter((rule) => !rule.is_open)
    .map((rule) => rule.weekday);

  const dateCheck = checkDate(fromISODate(checkout.required_date), {
    leadTimeDays: leadTime,
    blackouts: blackouts ?? [],
    closedWeekdays,
  });

  if (!dateCheck.available) {
    return {
      status: "error",
      message: `That date is no longer available (${dateCheck.reason}). Please pick another one.`,
    };
  }

  // ── Fees: area fee and late-night fee are independent and can stack,
  //    including inside the city where delivery is otherwise free ─────
  let deliveryFee = 0;
  let deliveryAreaName: string | null = null;

  if (checkout.fulfillment === "delivery" && checkout.delivery_area_id) {
    const { data: area } = await supabase
      .from("delivery_areas")
      .select("id, name, fee, is_active")
      .eq("id", checkout.delivery_area_id)
      .maybeSingle();

    if (!area || !area.is_active) {
      return { status: "error", message: "That delivery area is no longer available." };
    }

    deliveryFee = Number(area.fee) || 0;
    deliveryAreaName = area.name;
  }

  const settings = await getSettings();
  const lateNightFee = checkout.time_slot === "after-10" ? readLateNightFee(settings) : 0;

  const subtotal = pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal + deliveryFee + lateNightFee;

  // ── Insert order + items + opening event atomically ───────────────
  const { data: created, error: rpcError } = await supabase.rpc("create_website_order", {
    p_customer_name: checkout.customer_name,
    p_phone: checkout.phone,
    p_whatsapp: checkout.whatsapp ? checkout.whatsapp : checkout.phone,
    p_fulfillment: checkout.fulfillment,
    p_delivery_area_id: checkout.fulfillment === "delivery" ? checkout.delivery_area_id! : null,
    p_address: checkout.fulfillment === "delivery" ? (checkout.address ?? null) : null,
    p_required_date: checkout.required_date,
    p_time_slot: checkout.time_slot,
    p_subtotal: subtotal,
    p_delivery_fee: deliveryFee,
    p_late_night_fee: lateNightFee,
    p_total: total,
    p_payment_method: checkout.payment_method,
    p_payment_proof_url: checkout.payment_proof_url || null,
    p_occasion: checkout.occasion ?? null,
    // occasion_date defaults to the required date, which is what it is
    // in practice - that is the day being celebrated (§13.4).
    p_occasion_person: checkout.occasion_person || null,
    p_occasion_date:
      checkout.occasion && checkout.occasion !== "none" ? checkout.required_date : null,
    p_customer_note: checkout.customer_note || null,
    p_items: pricedItems.map((item) => ({
      product_id: item.productId,
      name_snapshot: item.name,
      size_label: item.sizeLabel,
      flavor: item.flavor,
      weight_kg: item.weightKg,
      unit_price: item.unitPrice,
      qty: item.qty,
      cake_message: item.cakeMessage,
      addons: [],
      reference_image_url: item.referenceImageUrl,
    })),
  });

  const row = Array.isArray(created) ? created[0] : created;

  if (rpcError || !row?.order_number) {
    return {
      status: "error",
      message: "We couldn't save your order. Please try again, or send it to us on WhatsApp.",
    };
  }

  return {
    status: "success",
    summary: {
      orderNumber: row.order_number,
      requiredDate: checkout.required_date,
      timeSlot: checkout.time_slot,
      fulfillment: checkout.fulfillment,
      deliveryAreaName,
      address: checkout.fulfillment === "delivery" ? (checkout.address ?? null) : null,
      customerName: checkout.customer_name,
      phone: checkout.phone,
      items: pricedItems.map((item) => ({
        name: item.name,
        sizeLabel: item.sizeLabel,
        flavor: item.flavor,
        qty: item.qty,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        cakeMessage: item.cakeMessage,
      })),
      subtotal,
      deliveryFee,
      lateNightFee,
      total,
      paymentMethod: checkout.payment_method,
      isFirstOrder: Boolean(row.is_first_order),
      advanceRequired: Boolean(row.advance_required),
      occasion: checkout.occasion ?? null,
      occasionPerson: checkout.occasion_person || null,
    },
  };
}
