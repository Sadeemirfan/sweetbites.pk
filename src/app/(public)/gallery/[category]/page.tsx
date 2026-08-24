import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/supabase/queries";

type PageProps = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Category not found | Sweet Bites" };

  return {
    title: `${category.name} in Arifwala | Sweet Bites`,
    description:
      category.description ??
      `${category.name} made to order in Arifwala, Punjab. Real prices, free delivery inside the city.`,
    alternates: { canonical: `/gallery/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Gallery", url: "/gallery" },
          { name: category.name, url: `/gallery/${category.slug}` },
        ])}
      />

      <Section tone="cream">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Gallery", href: "/gallery" },
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
                <ProductCard key={product.id} product={product} categorySlug={category.slug} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`No ${category.name.toLowerCase()} listed yet`}
              body="We almost certainly still make these - the listing just hasn't gone up. Send us a message and we'll tell you the options and prices."
            />
          )}
        </div>
      </Section>
    </>
  );
}
