import { Section, SectionHeader } from "@/components/ui/Section";
import type { BranchInfo } from "@/lib/branches";

export function WhySweetBites({ branchInfo }: { branchInfo: BranchInfo }) {
  // Free, no-charge-inside-the-city delivery is only actually confirmed
  // for Arifwala (it has real delivery-area/fee data behind it). Lahore
  // and Pattoki still deliver, but the fee isn't a settled fact yet, so
  // this must not claim "free" for them.
  const deliveryPoint =
    branchInfo.slug === "arifwala"
      ? {
          title: `Free delivery in ${branchInfo.city}`,
          body: "Anywhere inside the city, at no charge, up to 10:00 PM. Nearby villages are delivered for a small fee.",
        }
      : {
          title: `Delivery across ${branchInfo.city}`,
          body: "Message us your address on WhatsApp and we'll confirm whether we can reach you and what delivery costs.",
        };

  const points = [
    {
      title: "Made to order",
      body: "Nothing is pre-made. Your cake starts after you place the order, which is why it tastes fresh rather than stocked.",
    },
    {
      title: "No preservatives",
      body: "Real cream, real butter, nothing added to extend shelf life. Best eaten within two days of delivery.",
    },
    deliveryPoint,
    {
      title: "Open seven days",
      body: `${branchInfo.hoursDisplay}, including Sundays and public holidays.`,
    },
  ];

  return (
    <Section tone="cream">
      <SectionHeader
        eyebrow="Why Sweet Bites"
        title="A home kitchen, not a bakery counter"
        lead={`We are a small kitchen in ${branchInfo.city}. Everything below is a consequence of that, not a marketing line.`}
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {points.map((point) => (
          <div key={point.title} className="flex flex-col gap-2 border-t border-cream-200 pt-5">
            <h3 className="text-lg text-ink">{point.title}</h3>
            <p className="text-base text-ink/70">{point.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
