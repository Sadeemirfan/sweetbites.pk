import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getBranchInfo, isBranch } from "@/lib/branches";
import { SHOWCASE_IMAGES } from "@/lib/showcase";
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
    title: `Our Work | ${branchInfo.name}`,
    description: `Real cakes we've made for ${branchInfo.name} customers - browse for inspiration, then message us on WhatsApp.`,
    alternates: { canonical: `/${branch}/our-work` },
  };
}

export default async function OurWorkPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);
  const images = SHOWCASE_IMAGES[branch];

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Our Work" }]} />

      <SectionHeader
        eyebrow="Our Work"
        title="Cakes we've actually made"
        lead="Real orders, real customers - browse for ideas, then send us a picture of what you'd like."
      />

      <div className="mt-10">
        {images.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((src, index) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-md border border-cream-200"
              >
                <Image
                  src={src}
                  alt={`${branchInfo.name} - custom cake example ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Photos coming soon"
            body="We're still putting this gallery together - message us on WhatsApp and we'll send you examples directly."
            branchInfo={branchInfo}
          />
        )}
      </div>

      {images.length ? (
        <div className="mt-10 flex justify-center">
          <ButtonLink
            variant="whatsapp"
            href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
            external
          >
            <WhatsAppIcon />
            Ask about a design like this
          </ButtonLink>
        </div>
      ) : null}
    </Section>
  );
}
