"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalisePhone } from "@/lib/order/schema";

export type ManualItemInput = {
  /** null for a free-text line - §13.1 makes those essential. */
  productId: string | null;
  name: string;
  sizeLabel: string | null;
  flavor: string | null;
  unitPrice: number;
  qty: number;
  cakeMessage: string | null;
};

export type ManualOrderInput = {
  source: string;
  phone: string;
  customerName: string;
  whatsapp: string | null;
  fulfillment: "pickup" | "delivery";
  deliveryAreaId: string | null;
  address: string | null;
  deliveryFee: number;
  lateNightFee: number;
  requiredDate: string;
  timeSlot: string | null;
  items: ManualItemInput[];
  discount: number;
  occasion: string | null;
  occasionPerson: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  advancePaid: number;
  adminNote: string | null;
};

export type ManualOrderResult =
  | { ok: true; orderId: string; orderNumber: string | null }
  | { ok: false; message: string };

/**
 * §13.1 - manual entry for orders that arrived on WhatsApp, social, the
 * phone, or in person.
 *
 * Two things are deliberately different from the website checkout:
 *
 *  1. NO lead-time validation. "If the baker says a cake is going out
 *     tomorrow, the system accepts it." The date is stored exactly as
 *     typed; the form shows a soft warning and nothing here blocks.
 *  2. Prices are taken as entered, including free-text lines, because
 *     real orders often don't match the catalogue. The website's
 *     server-side repricing exists to stop a stranger editing a total -
 *     it makes no sense against the owner typing her own prices.
 *
 * Written through the cookie client, so RLS still requires an admin.
 */
export async function createManualOrder(
  input: ManualOrderInput
): Promise<ManualOrderResult> {
  const phone = normalisePhone(input.phone);

  if (!/^03\d{9}$/.test(phone)) {
    return { ok: false, message: "Enter a valid phone number, e.g. 0321 7337801." };
  }
  if (!input.items.length) {
    return { ok: false, message: "Add at least one item." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.requiredDate)) {
    return { ok: false, message: "Choose the date this order is needed." };
  }

  const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const total = subtotal + input.deliveryFee + input.lateNightFee - input.discount;

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      source: input.source,
      customer_name: input.customerName || null,
      phone,
      whatsapp: input.whatsapp ? normalisePhone(input.whatsapp) : phone,
      fulfillment: input.fulfillment,
      delivery_area_id: input.fulfillment === "delivery" ? input.deliveryAreaId : null,
      address: input.fulfillment === "delivery" ? input.address : null,
      required_date: input.requiredDate,
      time_slot: input.timeSlot,
      subtotal,
      delivery_fee: input.deliveryFee,
      late_night_fee: input.lateNightFee,
      discount: input.discount,
      total,
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      advance_paid: input.advancePaid,
      occasion: input.occasion,
      occasion_person: input.occasionPerson,
      occasion_date:
        input.occasion && input.occasion !== "none" ? input.requiredDate : null,
      admin_note: input.adminNote,
      // Confirmed by definition - the baker is entering it because the
      // customer already agreed on WhatsApp or at the counter.
      status: "confirmed",
    })
    .select("id, order_number")
    .single();

  if (error || !order) {
    return { ok: false, message: "Couldn't save the order. Please try again." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      name_snapshot: item.name,
      size_label: item.sizeLabel,
      flavor: item.flavor,
      unit_price: item.unitPrice,
      qty: item.qty,
      cake_message: item.cakeMessage,
    }))
  );

  if (itemsError) {
    // No transaction wrapper here: the RPC used by the website is
    // revoked from everyone but service_role, and an admin-only path
    // that fails part-way is recoverable by hand. Rather than leave an
    // order with no items, roll it back explicitly.
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, message: "Couldn't save the order items. Please try again." };
  }

  await supabase.from("order_events").insert({
    order_id: order.id,
    status: "confirmed",
    note: `Entered by hand from ${input.source}.`,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/kitchen");

  return { ok: true, orderId: order.id, orderNumber: order.order_number };
}
