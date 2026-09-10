import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/supabase/queries";
import { getBranchInfo, isBranch } from "@/lib/branches";

type PageProps = { params: Promise<{ branch: string; category: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { branch, category: slug } = await params;
  if (!isBranch(branch)) return {};
  const branchInfo = getBranchInfo(branch);
  const category = await getCategoryBySlug(branch, slug);

  if (!category) return { title: `Category not found | ${branchInfo.shortName}` };

  return {
    title: `${category.name} in ${branchInfo.city} | ${branchInfo.shortName}`,
    description:
      category.description ??
      `${category.name} made to order in ${branchInfo.city}, ${branchInfo.region}. Homemade, baked fresh after you order - message us on WhatsApp for prices.`,
    alternates: { canonical: `/${branch}/gallery/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { branch, category: slug } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  const category = await getCategoryBySlug(branch, slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", url: `/${branch}` },
          { name: "Gallery", url: `/${branch}/gallery` },
          { name: category.name, url: `/${branch}/gallery/${category.slug}` },
        ])}
      />

      <Section tone="cream">
        <Breadcrumbs
          items={[
            { name: "Home", href: `/${branch}` },
            { name: "Gallery", href: `/${branch}/gallery` },
            { name: category.name },
          ]}
        />

        <SectionHeader
          eyebrow={`${products.length} ${products.length === 1 ? "cake" : "cakes"}`}
          title={category.name}
          lead={category.description ?? undefined}
        />

        <div className="mt-10">
          {products.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categorySlug={category.slug}
                  branchInfo={branchInfo}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`No ${category.name.toLowerCase()} listed yet`}
              body="We almost certainly still make these - the listing just hasn't gone up. Send us a message and we'll tell you the options and prices."
              branchInfo={branchInfo}
            />
          )}
        </div>
      </Section>
    </>
  );
}
