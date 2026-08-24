"use server";

import { createClient } from "@/lib/supabase/server";
import { earliestDate, toISODate } from "@/lib/availability";
import { LEAD_TIME } from "@/lib/constants";

export type CustomCakeState = {
  status: "idle" | "success" | "error";
  message: string;
  /** Set on success so the client can offer the WhatsApp handoff (§10). */
  submitted?: {
    occasion: string | null;
    tiers: number | null;
    weightKg: number | null;
    flavor: string | null;
    requiredDate: string | null;
  };
};

export async function submitCustomCakeRequest(
  _prev: CustomCakeState,
  formData: FormData
): Promise<CustomCakeState> {
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success", message: "Thank you - your request has been sent." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const occasion = String(formData.get("occasion") ?? "").trim() || null;
  const flavor = String(formData.get("flavor") ?? "").trim() || null;
  const theme = String(formData.get("theme_description") ?? "").trim() || null;
  const requiredDate = String(formData.get("required_date") ?? "").trim() || null;

  const tiersRaw = Number(formData.get("tiers") ?? 0);
  const weightRaw = Number(formData.get("weight_kg") ?? 0);
  const budgetMinRaw = Number(formData.get("budget_min") ?? 0);
  const budgetMaxRaw = Number(formData.get("budget_max") ?? 0);

  const tiers = Number.isFinite(tiersRaw) && tiersRaw > 0 ? Math.trunc(tiersRaw) : null;
  const weightKg = Number.isFinite(weightRaw) && weightRaw > 0 ? weightRaw : null;
  const budgetMin = Number.isFinite(budgetMinRaw) && budgetMinRaw > 0 ? budgetMinRaw : null;
  const budgetMax = Number.isFinite(budgetMaxRaw) && budgetMaxRaw > 0 ? budgetMaxRaw : null;

  if (!name) return { status: "error", message: "Please tell us your name." };
  if (!/^[\d\s+()-]{10,}$/.test(phone)) {
    return { status: "error", message: "Please enter a valid phone number we can reach you on." };
  }
  if (!theme) {
    return { status: "error", message: "Please describe the cake you have in mind." };
  }

  // §8 rule 6 - the client-side min date is for UX only, so re-check it
  // here. Custom work needs three days, not two (§10).
  if (requiredDate) {
    const min = toISODate(earliestDate(LEAD_TIME.custom));
    if (requiredDate < min) {
      return {
        status: "error",
        message: `Custom cakes need at least ${LEAD_TIME.custom} days. The earliest we can do is ${min}.`,
      };
    }
  }

  const referenceImages = formData
    .getAll("reference_images")
    .map((value) => String(value))
    .filter(Boolean);

  const supabase = await createClient();
  const { error } = await supabase.from("custom_cake_requests").insert({
    name,
    phone,
    occasion,
    tiers,
    weight_kg: weightKg,
    flavor,
    theme_description: theme,
    reference_images: referenceImages.length ? referenceImages : null,
    budget_min: budgetMin,
    budget_max: budgetMax,
    required_date: requiredDate,
  });

  if (error) {
    return {
      status: "error",
      message: "We couldn't send that just now. Please try again, or message us on WhatsApp.",
    };
  }

  return {
    status: "success",
    message: "Your request has been sent. We'll come back with a price on WhatsApp.",
    submitted: { occasion, tiers, weightKg, flavor, requiredDate },
  };
}
