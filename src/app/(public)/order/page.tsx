import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { CheckoutFlow } from "@/app/(public)/order/CheckoutFlow";
import { createClient } from "@/lib/supabase/server";
import { getDeliveryAreas } from "@/lib/supabase/queries";
import { getSettings, readLateNightFee, readPaymentDetails } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Checkout | Sweet Bites Arifwala",
  description: "Complete your cake order from Sweet Bites Arifwala.",
  robots: { index: false, follow: false },
};

export default async function OrderPage() {
  const supabase = await createClient();

  const [areas, settings, blackoutsResult, rulesResult] = await Promise.all([
    getDeliveryAreas(),
    getSettings(),
    supabase.from("blackout_dates").select("date, reason"),
    supabase.from("availability_rules").select("weekday, is_open"),
  ]);

  const closedWeekdays = (rulesResult.data ?? [])
    .filter((rule) => !rule.is_open)
    .map((rule) => rule.weekday);

  return (
    <Section tone="cream">
      <CheckoutFlow
        areas={areas.map((area) => ({
          id: area.id,
          name: area.name,
          fee: Number(area.fee) || 0,
          isInsideCity: area.is_inside_city,
        }))}
        blackouts={blackoutsResult.data ?? []}
        closedWeekdays={closedWeekdays}
        lateNightFee={readLateNightFee(settings)}
        paymentDetails={readPaymentDetails(settings)}
      />
    </Section>
  );
}
