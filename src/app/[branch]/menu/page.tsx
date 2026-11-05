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

      <div className="max-w-3xl">
        <SectionHeader
          as="h1"
          eyebrow="Price list"
          title={`The ${branchInfo.city} menu`}
          lead="Every cake, dessert, and current price. We update this whenever recipes or prices change."
        />

        {menuImageUrl ? (
          <div className="mt-8 overflow-hidden rounded-lg border border-cream-200 bg-cream-100 shadow-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={menuImageUrl}
              alt={`${branchInfo.name} menu`}
              className="w-full object-contain"
            />
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
            trackEvent={{
              name: "whatsapp_click",
              params: {
                branch: branchInfo.slug,
                location: "menu",
              },
            }}
          >
            <WhatsAppIcon />
            Order on WhatsApp
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
