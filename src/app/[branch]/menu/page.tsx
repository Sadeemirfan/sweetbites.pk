import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getBranchMenuImageUrl } from "@/lib/settings";
import { getBranchInfo, isBranch } from "@/lib/branches";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";

export const dynamic = "force-dynamic";

type Params = { branch: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { branch } = await params;
  if (!isBranch(branch)) return {};
  const branchInfo = getBranchInfo(branch);
  const menuImageUrl = await getBranchMenuImageUrl(branch);
  const hasMenuImage = Boolean(menuImageUrl);

  const title = `Menu & Prices | ${branchInfo.name}`;
  const description = `The current ${branchInfo.name} price list - every cake, dessert, and price.`;

  return {
    title,
    description,
    alternates: { canonical: `/${branch}/menu` },
    ...(!hasMenuImage ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url: `/${branch}/menu`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function MenuPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);
  const menuImageUrl = await getBranchMenuImageUrl(branch);

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Menu" }]} />

      <SectionHeader
        as="h1"
        eyebrow="Menu"
        title="Prices"
        lead="The gallery is for browsing what we make - this is where the actual, current prices live."
      />

      <div className="mt-8 max-w-2xl">
        {menuImageUrl ? (
          <div className="overflow-hidden rounded-lg border border-cream-200 shadow-cream">
            {/*
              A plain <img>, not next/image - the owner re-uploads this
              whenever prices change, so its real dimensions aren't known
              ahead of time. next/image needs a fixed width/height to
              reserve layout space, which would distort or crop a photo
              whose actual aspect ratio doesn't match.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={menuImageUrl} alt={`${branchInfo.name} price list`} className="h-auto w-full" />
          </div>
        ) : (
          <EmptyState
            title="Menu coming soon"
            body="The price list isn't posted yet - message us on WhatsApp and we'll send you the current menu directly."
            action="none"
          />
        )}

        <div className="mt-6">
          <ButtonLink
            variant="whatsapp"
            href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
            external
          >
            <WhatsAppIcon />
            Order on WhatsApp
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
