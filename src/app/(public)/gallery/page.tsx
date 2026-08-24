import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section, SectionHeader } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { getCategoriesWithCounts } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Cake Gallery & Prices in Arifwala | Sweet Bites",
  description:
    "Browse every cake Sweet Bites Arifwala makes - birthday cakes, wedding and tiered cakes, cupcakes, fondant theme cakes and cheesecakes, with real PKR prices.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Gallery", url: "/gallery" },
        ])}
      />

      <Section tone="cream">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Gallery" }]} />

        <SectionHeader
          eyebrow="The catalogue"
          title="Every cake we make"
          lead="Prices are per cake and shown in full - no hidden quotes. Pick a category to see sizes, flavours, and what each one costs."
        />

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
    </>
  );
}
