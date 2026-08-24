import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getFeaturedProducts } from "@/lib/supabase/queries";

export async function Bestsellers() {
  const products = await getFeaturedProducts(6);

  return (
    <Section tone="cream" className="pt-0 md:pt-0">
      <div className="border-t border-cream-200 pt-12 md:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Bestsellers"
            title="What people order most"
            lead="The six cakes that come up again and again on WhatsApp."
          />
          <ButtonLink variant="outline" href="/gallery">
            See everything
          </ButtonLink>
        </div>

        <div className="mt-10">
          {products.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categorySlug={product.category?.slug ?? ""}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bestsellers picked yet"
              body="Nothing has been marked as featured. Browse the full gallery to see everything we make."
              action="gallery"
            />
          )}
        </div>
      </div>
    </Section>
  );
}
