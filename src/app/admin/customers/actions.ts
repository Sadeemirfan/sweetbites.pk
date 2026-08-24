"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveCustomerNotes(
  id: string,
  notes: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({ notes: notes.trim() || null })
    .eq("id", id);

  if (error) return { ok: false, message: "Couldn't save that note." };

  revalidatePath(`/admin/customers/${id}`);
  return { ok: true };
}
