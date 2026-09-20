import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getSettings } from "@/lib/settings";
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
    title: `Menu & Prices | ${branchInfo.name}`,
    description: `The current ${branchInfo.name} price list - every cake, dessert, and price.`,
    alternates: { canonical: `/${branch}/menu` },
  };
}

export default async function MenuPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  // Arifwala's admin can upload a new menu photo any time it changes
  // (site_settings). Lahore and Pattoki have no admin dashboard, so
  // theirs is plain config - see the note in branches.ts.
  let menuImageUrl = branchInfo.menuImageUrl;
  if (branch === "arifwala") {
    const settings = await getSettings();
    menuImageUrl = typeof settings.menu_image_url === "string" ? settings.menu_image_url : null;
  }

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Menu" }]} />

      <SectionHeader
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
