import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { Bestsellers } from "@/components/sections/Bestsellers";
import { CustomCakesSection } from "@/components/sections/CustomCakesSection";
import { WhySweetBites } from "@/components/sections/WhySweetBites";
import { WhyTwoDays } from "@/components/sections/WhyTwoDays";
import { ReviewsPreview } from "@/components/sections/ReviewsPreview";
import { LocationHours } from "@/components/sections/LocationHours";
import { JsonLd } from "@/components/seo/JsonLd";
import { bakerySchema } from "@/lib/seo/jsonld";
import { getReviewAggregate } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Homemade Cakes in Arifwala | Sweet Bites",
  description:
    "Made-to-order homemade cakes in Arifwala, Punjab. Birthday, wedding, and custom theme cakes baked after you order. Free delivery inside Arifwala. Order on WhatsApp.",
  alternates: { canonical: "/" },
};

/**
 * Section rhythm follows §9 and the "morning kitchen" concept (§2.2):
 * dark hero + process, cream catalogue, one dark custom-cake break,
 * cream trust sections, then dark location running into the dark footer.
 *
 * Light sections that touch a wiped dark section stay --cream-50 (the
 * body colour) so the clip-path wedge reveals the same tone - see the
 * note in globals.css.
 */
export default async function HomePage() {
  const aggregate = await getReviewAggregate();

  return (
    <>
      <JsonLd schema={bakerySchema(aggregate)} />
      <Hero />
      <ProcessSection />
      <CategoryGrid />
      <Bestsellers />
      <CustomCakesSection />
      <WhySweetBites />
      <WhyTwoDays />
      <ReviewsPreview />
      <LocationHours />
    </>
  );
}
