import { ButtonLink } from "@/components/ui/Button";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getCategoriesWithCounts } from "@/lib/supabase/queries";

export async function CategoryGrid() {
  const categories = await getCategoriesWithCounts();

  return (
    <Section tone="cream">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeader
          eyebrow="Browse by category"
          title="What we make"
          lead="Every price below is the real price. Tap any cake to see sizes and flavours."
        />
        <ButtonLink variant="outline" href="/gallery">
          See all categories
        </ButtonLink>
      </div>

      <div className="mt-10">
        {categories.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="The catalogue is being set up"
            body="Our cakes aren't listed online yet. Message us on WhatsApp and we'll send you the current menu and prices."
          />
        )}
      </div>
    </Section>
  );
}
