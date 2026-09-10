import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section, SectionHeader } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { getCategoriesWithCounts } from "@/lib/supabase/queries";
import { getBranchInfo, isBranch } from "@/lib/branches";

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

  const categories = await getCategoriesWithCounts(branch);

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
          lead="Pick a category to see sizes and flavours - the menu page has current prices."
        />

        <div className="mt-10">
          {categories.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} branch={branch} />
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
      </Section>
    </>
  );
}
