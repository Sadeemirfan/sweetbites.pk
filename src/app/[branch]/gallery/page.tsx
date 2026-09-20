import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { getAllProducts } from "@/lib/supabase/queries";
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
    title: `Homemade Cakes in ${branchInfo.city} - Custom & Birthday Cake Gallery | ${branchInfo.shortName}`,
    description: `Browse every homemade cake ${branchInfo.name} makes - birthday, wedding, and custom theme cakes. Message us on WhatsApp for current prices.`,
    alternates: { canonical: `/${branch}/gallery` },
  };
}

export default async function GalleryPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  const products = await getAllProducts(branch);

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", url: `/${branch}` },
          { name: "Gallery", url: `/${branch}/gallery` },
        ])}
      />

      <Section tone="cream">
        <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Gallery" }]} />

        <SectionHeader
          eyebrow="The catalogue"
          title="Every cake we make"
          lead="Tap any cake for sizes and flavours - message us on WhatsApp for the price."
        />

        <div className="mt-10">
          {products.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categorySlug={product.category?.slug ?? ""}
                  branchInfo={branchInfo}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="The catalogue is being set up"
              body="Our cakes aren't listed online yet. Message us on WhatsApp and we'll send you the current menu and prices."
              branchInfo={branchInfo}
            />
          )}
        </div>

        {products.length ? (
          <div className="mt-10 flex justify-center">
            <ButtonLink
              variant="whatsapp"
              href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
              external
            >
              <WhatsAppIcon />
              Order on WhatsApp
            </ButtonLink>
          </div>
        ) : null}
      </Section>
    </>
  );
}
