"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * §13.4 step 5 - log the reminder and mark what came of it, so it isn't
 * shown again this year and the baker can see the outcome.
 *
 * reminder_log has UNIQUE (order_id, reminder_date), so an upsert on
 * that pair is what keeps a second tap from creating a duplicate row.
 */
export async function logReminder(input: {
  orderId: string;
  customerId: string | null;
  reminderDate: string;
  occasionDate: string;
  status: "contacted" | "ordered" | "dismissed";
  note?: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("reminder_log").upsert(
    {
      order_id: input.orderId,
      customer_id: input.customerId,
      reminder_date: input.reminderDate,
      occasion_date: input.occasionDate,
      status: input.status,
      note: input.note ?? null,
    },
    { onConflict: "order_id,reminder_date" }
  );

  if (error) return { ok: false, message: "Couldn't save that." };

  revalidatePath("/admin/reminders");
  revalidatePath("/admin");
  return { ok: true };
}
