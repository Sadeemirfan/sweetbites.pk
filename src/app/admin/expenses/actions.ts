"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; message: string };

export async function saveExpense(input: {
  id?: string;
  categoryId: string | null;
  item: string;
  vendor: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  amount: number;
  purchasedOn: string;
  paymentMethod: string | null;
  note: string | null;
  receiptUrl: string | null;
  /** "business" feeds the Reports P&L, "home" is tracked but excluded from it. */
  expenseType: "business" | "home";
}): Promise<Result> {
  if (!input.item.trim()) return { ok: false, message: "What did you buy?" };
  if (!(input.amount > 0)) return { ok: false, message: "Enter the amount paid." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.purchasedOn)) {
    return { ok: false, message: "Choose the date of purchase." };
  }

  const supabase = await createClient();
  const payload = {
    category_id: input.categoryId,
    item: input.item.trim(),
    vendor: input.vendor?.trim() || null,
    quantity: input.quantity,
    unit: input.unit?.trim() || null,
    unit_price: input.unitPrice,
    amount: input.amount,
    purchased_on: input.purchasedOn,
    payment_method: input.paymentMethod,
    note: input.note?.trim() || null,
    receipt_url: input.receiptUrl,
    expense_type: input.expenseType,
  };

  const { error } = input.id
    ? await supabase.from("expenses").update(payload).eq("id", input.id)
    : await supabase.from("expenses").insert(payload);

  if (error) return { ok: false, message: "Couldn't save that expense." };

  revalidatePath("/admin/expenses");
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { ok: false, message: "Couldn't delete that." };

  revalidatePath("/admin/expenses");
  revalidatePath("/admin/reports");
  return { ok: true };
}
