import { createClient } from "@/lib/supabase/server";

export type PaymentAccount = { number?: string; name?: string };
export type BankAccount = {
  bank_name?: string;
  account_title?: string;
  account_number?: string;
  iban?: string;
};

export type PaymentDetails = {
  jazzcash?: PaymentAccount;
  easypaisa?: PaymentAccount;
  bank?: BankAccount;
};

/**
 * site_settings is public-read (§5), so these come back with the anon
 * client. Every value is admin-editable from /admin/settings in Phase 5 -
 * §12 is explicit that changing a fee must never require a developer,
 * so nothing here is hardcoded.
 */
export async function getSettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");

  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
}

/** Applied to the "After 10 PM" slot, on top of any area fee (§7 step 3). */
export function readLateNightFee(settings: Record<string, unknown>): number {
  const raw = settings.late_night_fee;
  const value = typeof raw === "string" ? Number(raw) : raw;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function readPaymentDetails(settings: Record<string, unknown>): PaymentDetails {
  const raw = settings.payment_details;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as PaymentDetails) : {};
}
