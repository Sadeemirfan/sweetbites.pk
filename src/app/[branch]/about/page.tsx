import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getBranchInfo, isBranch } from "@/lib/branches";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";

type Params = { branch: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { branch } = await params;
  if (!isBranch(branch)) return {};
  const branchInfo = getBranchInfo(branch);

  return {
    title: `About Our Home Kitchen | ${branchInfo.name}`,
    description: `${branchInfo.name} is a home kitchen in ${branchInfo.city}. Every cake is made to order, with no preservatives and nothing pre-made.`,
    alternates: { canonical: `/${branch}/about` },
  };
}

export default async function AboutPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  return (
    <>
      <Section tone="cream">
        <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "About" }]} />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-6">
            <SectionHeader eyebrow="Our story" title={`A home kitchen in ${branchInfo.city}`} />

            <div className="flex flex-col gap-4 text-base leading-relaxed text-ink/75">
              <p>
                {branchInfo.name} began as a family kitchen&apos;s passion project - baking for
                birthdays and small gatherings, then a phone that wouldn&apos;t stop ringing before
                Eid. What started as baking for people we knew grew into bringing homemade,
                made-to-order cakes to every corner of {branchInfo.city}.
              </p>
              <p>
                We don&apos;t just bake cakes - we bake the ones for birthdays, walimas,
                engagements, graduations, and plenty of ordinary Tuesdays. Every order is started
                fresh after you ask for it, with real cream and real butter, nothing pre-made and
                nothing sitting under glass.
              </p>
              <p>
                Every cake we make is made specifically for you, not pulled off a shelf. Message us
                on WhatsApp and we&apos;ll talk you through sizes, flavours, and what it&apos;ll
                cost.
              </p>
            </div>

            <ButtonLink
              variant="whatsapp"
              href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
              external
            >
              <WhatsAppIcon />
              Talk to us on WhatsApp
            </ButtonLink>
          </div>

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
    </>
  );
}
