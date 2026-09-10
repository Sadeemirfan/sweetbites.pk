"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { lookupCustomerByPhone } from "@/lib/admin/queries";
import { normalisePhone } from "@/lib/order/schema";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Admin mutations. All of them go through the cookie-backed client, so
 * RLS checks is_admin() on every write - the service-role key is never
 * used here. A signed-out request simply fails the policy.
 */

type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * §12 - "drag to move, every move writing an order_events row." The
 * event log is what makes the order timeline real, so the two writes
 * belong together.
 */
export async function moveOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { ok: false, message: "Couldn't move that order." };

  await supabase.from("order_events").insert({
    order_id: orderId,
    status,
    note: "Status changed from the dashboard.",
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateOrderFields(
  orderId: string,
  fields: {
    payment_status?: string;
    payment_method?: string | null;
    advance_paid?: number;
    admin_note?: string | null;
    occasion?: string | null;
    occasion_person?: string | null;
    occasion_date?: string | null;
  }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update(fields).eq("id", orderId);
  if (error) return { ok: false, message: "Couldn't save those changes." };

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/** §13.1 - the phone lookup that drives the whole manual-entry form. */
export async function findCustomer(rawPhone: string) {
  const phone = normalisePhone(rawPhone);
  if (!/^03\d{9}$/.test(phone)) return null;

  const customer = await lookupCustomerByPhone(phone);
  if (!customer) return null;

  return {
    id: customer.id,
    name: customer.name,
    whatsapp: customer.whatsapp,
    address: customer.address,
    areaId: customer.area_id,
    totalOrders: customer.total_orders,
    lastOrderDate: customer.last_order_date,
  };
}

// ── Categories ───────────────────────────────────────────────────────

export async function saveCategory(input: {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const payload = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    image_url: input.image_url,
    is_active: input.is_active,
  };

  const { error } = input.id
    ? await supabase.from("categories").update(payload).eq("id", input.id)
    : await supabase.from("categories").insert(payload);

  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "That web address is already used." : "Couldn't save.",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/arifwala/gallery");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    // FK restrict - the category still holds products.
    return {
      ok: false,
      message: "Move or delete this category's cakes first.",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/arifwala/gallery");
  return { ok: true };
}

export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  const supabase = await createClient();

  await Promise.all(
    ids.map((id, index) =>
      supabase.from("categories").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/admin/categories");
  revalidatePath("/arifwala/gallery");
  return { ok: true };
}

// ── Products ─────────────────────────────────────────────────────────

export async function saveProduct(input: {
  id?: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number | null;
  cost_estimate: number | null;
  image_url: string | null;
  sizes: { label: string; weight_kg: number | null; price: number }[];
  flavors: string[];
  lead_time_days: number;
  is_active: boolean;
  is_featured: boolean;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const payload = {
    category_id: input.category_id,
    name: input.name,
    slug: input.slug,
    description: input.description,
    base_price: input.base_price,
    cost_estimate: input.cost_estimate,
    image_url: input.image_url,
    sizes: input.sizes,
    flavors: input.flavors,
    lead_time_days: input.lead_time_days,
    is_active: input.is_active,
    is_featured: input.is_featured,
  };

  const { error } = input.id
    ? await supabase.from("products").update(payload).eq("id", input.id)
    : await supabase.from("products").insert(payload);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Another cake in this category already uses that web address."
          : "Couldn't save.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/arifwala/gallery");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: "Couldn't delete that cake." };

  revalidatePath("/admin/products");
  revalidatePath("/arifwala/gallery");
  return { ok: true };
}

export async function reorderProducts(ids: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  await Promise.all(
    ids.map((id, index) => supabase.from("products").update({ sort_order: index }).eq("id", id))
  );
  revalidatePath("/admin/products");
  revalidatePath("/arifwala/gallery");
  return { ok: true };
}

export async function toggleProductFlag(
  id: string,
  field: "is_active" | "is_featured",
  value: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const patch = field === "is_active" ? { is_active: value } : { is_featured: value };
  const { error } = await supabase.from("products").update(patch).eq("id", id);

  if (error) return { ok: false, message: "Couldn't update that." };

  revalidatePath("/admin/products");
  revalidatePath("/arifwala/gallery");
  return { ok: true };
}

// ── Reviews ──────────────────────────────────────────────────────────

export async function setReviewApproval(id: string, approved: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ is_approved: approved }).eq("id", id);
  if (error) return { ok: false, message: "Couldn't update that review." };

  revalidatePath("/admin/reviews");
  revalidatePath("/arifwala/reviews");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, message: "Couldn't delete that review." };

  revalidatePath("/admin/reviews");
  revalidatePath("/arifwala/reviews");
  return { ok: true };
}

// ── Custom requests ──────────────────────────────────────────────────

export async function updateCustomRequest(
  id: string,
  fields: { status?: string; quoted_price?: number | null; admin_reply?: string | null }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("custom_cake_requests").update(fields).eq("id", id);
  if (error) return { ok: false, message: "Couldn't update that request." };

  revalidatePath("/admin/custom-requests");
  return { ok: true };
}

// ── Availability ─────────────────────────────────────────────────────

/**
 * §12/§8 rule 4 - the admin blocks a date by hand, with a reason. The
 * system never does this on its own, and there is deliberately no
 * capacity threshold anywhere that could.
 */
export async function toggleBlackout(
  dateIso: string,
  reason: string | null
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("blackout_dates")
    .select("id")
    .eq("date", dateIso)
    .maybeSingle();

  if (existing) {
    await supabase.from("blackout_dates").delete().eq("id", existing.id);
  } else {
    const { error } = await supabase
      .from("blackout_dates")
      .insert({ date: dateIso, reason: reason?.trim() || null });
    if (error) return { ok: false, message: "Couldn't block that date." };
  }

  revalidatePath("/admin/availability");
  return { ok: true };
}

// ── Delivery areas ───────────────────────────────────────────────────

export async function saveDeliveryArea(input: {
  id?: string;
  name: string;
  fee: number;
  is_inside_city: boolean;
  is_active: boolean;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const payload = {
    name: input.name,
    fee: input.fee,
    is_inside_city: input.is_inside_city,
    is_active: input.is_active,
  };

  const { error } = input.id
    ? await supabase.from("delivery_areas").update(payload).eq("id", input.id)
    : await supabase.from("delivery_areas").insert(payload);

  if (error) return { ok: false, message: "Couldn't save that area." };

  revalidatePath("/admin/delivery-areas");
  revalidatePath("/arifwala/contact");
  return { ok: true };
}

export async function deleteDeliveryArea(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("delivery_areas").delete().eq("id", id);
  if (error) return { ok: false, message: "Couldn't delete that area." };

  revalidatePath("/admin/delivery-areas");
  return { ok: true };
}

// ── Settings ─────────────────────────────────────────────────────────

/**
 * §12 - "Changing site text or any fee must never require a developer."
 * Values are stored as jsonb, so each one is written as parsed JSON.
 */
export async function saveSetting(key: string, value: unknown): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: value as never }, { onConflict: "key" });

  if (error) return { ok: false, message: "Couldn't save that setting." };

  revalidatePath("/admin/settings");
  revalidatePath("/arifwala", "layout");
  return { ok: true };
}
