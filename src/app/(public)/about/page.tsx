import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Section, SectionHeader } from "@/components/ui/Section";
import { WhyTwoDays } from "@/components/sections/WhyTwoDays";
import { DEFAULT_WHATSAPP_MESSAGE, whatsappLink } from "@/lib/utils/whatsapp";

export const metadata: Metadata = {
  title: "About Our Home Kitchen | Sweet Bites Arifwala",
  description:
    "Sweet Bites is a home kitchen in Gulshan-e-Wahab, Arifwala. Every cake is made to order, with no preservatives and nothing pre-made.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Section tone="cream">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About" }]} />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-6">
            <SectionHeader
              eyebrow="Our story"
              title="A kitchen in Gulshan-e-Wahab"
            />

            <div className="flex flex-col gap-4 text-base leading-relaxed text-ink/75">
              <p>
                Sweet Bites started the way most home kitchens do - one cake for family, then one
                for a neighbour, then a phone that wouldn&apos;t stop ringing before Eid. We are
                still that kitchen. There is no factory behind this, no shop counter with cakes
                sitting under glass.
              </p>
              <p>
                That is the whole reason we ask for two days. A cake you can collect in an hour was
                baked before you asked for it, and it was made to survive a few days on a shelf.
                Ours is not. Your sponge goes in the oven after your order comes in, the cream is
                whipped the morning it is due, and it reaches you the same day it is finished.
              </p>
              <p>
                We bake for birthdays, walimas, engagements, graduations, office launches, and
                plenty of ordinary Tuesdays. Most orders still arrive on WhatsApp, and that is
                fine - this website exists so you can see what we make and what it costs before
                you message.
              </p>
            </div>

            <ButtonLink variant="whatsapp" href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)} external>
              <WhatsAppIcon />
              Talk to us on WhatsApp
            </ButtonLink>
          </div>

          {/*
            §17 lists 2–3 kitchen/process photos as outstanding client
            content. Placeholders here rather than stock photography -             a stock kitchen would undo the point the copy is making.
          */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <ImagePlaceholder
              className="aspect-[4/3] w-full rounded-lg border border-cream-200"
              label="Kitchen photo coming soon"
            />
            <ImagePlaceholder
              className="aspect-[4/3] w-full rounded-lg border border-cream-200"
              label="Process photo coming soon"
            />
          </div>
        </div>
      </Section>

      <WhyTwoDays />
    </>
  );
}
