import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CustomCakeForm } from "@/app/(public)/custom-cake/CustomCakeForm";
import { earliestDate, toISODate } from "@/lib/availability";
import { formatLongDate } from "@/lib/utils/format";
import { LEAD_TIME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Custom Cakes in Arifwala | Sweet Bites",
  description:
    "Request a custom theme, tiered, or wedding cake in Arifwala. Send your design and budget, and we'll quote you on WhatsApp. Minimum three days' notice.",
  alternates: { canonical: "/custom-cake" },
};

export default function CustomCakePage() {
  const earliest = earliestDate(LEAD_TIME.custom);

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Custom cake" }]} />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="Custom cakes"
            title="Tell us what you have in mind"
            lead="Five short steps. Nothing is charged and nothing is confirmed here - we read your request and come back with a price on WhatsApp."
          />

          <div className="rounded-lg border border-cream-200 bg-cream-100 p-4">
            <p className="text-base text-ink">
              The earliest date we can take for custom work is{" "}
              <span className="font-medium">{formatLongDate(earliest)}</span>.
            </p>
            <p className="mt-1 text-sm text-ink/70">
              Elaborate designs - sugar flowers, modelled figures, three tiers or more - are much
              better with five days or a week.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-ink/70">
            <h2 className="text-base font-medium text-ink">What helps us quote faster</h2>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              <li>A reference picture, even a rough one</li>
              <li>Number of guests, if you don&apos;t know the weight</li>
              <li>The exact name and age to write on the cake</li>
              <li>Your honest budget range - it changes what we suggest</li>
            </ul>
          </div>
        </div>

        <CustomCakeForm minDate={toISODate(earliest)} />
      </div>
    </Section>
  );
}
