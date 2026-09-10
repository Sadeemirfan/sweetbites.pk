import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { Bestsellers } from "@/components/sections/Bestsellers";
import { CustomCakesSection } from "@/components/sections/CustomCakesSection";
import { WhySweetBites } from "@/components/sections/WhySweetBites";
import { ReviewsPreview } from "@/components/sections/ReviewsPreview";
import { LocationHours } from "@/components/sections/LocationHours";
import { JsonLd } from "@/components/seo/JsonLd";
import { bakerySchema } from "@/lib/seo/jsonld";
import { getApprovedReviews, getReviewAggregate } from "@/lib/supabase/queries";
import { getBranchInfo, isBranch } from "@/lib/branches";
import { notFound } from "next/navigation";

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
    title: `Homemade Cakes in ${branchInfo.city} - Custom Birthday & Wedding Cakes | ${branchInfo.shortName}`,
    description: `Custom, homemade cakes in ${branchInfo.city}, ${branchInfo.region} - birthday, wedding, and theme cakes, baked fresh after you order. Order on WhatsApp.`,
    alternates: { canonical: `/${branch}` },
  };
}

/**
 * Section rhythm follows §9 and the "morning kitchen" concept (§2.2):
 * dark hero, cream catalogue, one dark custom-cake break, cream trust
 * sections, then dark location running into the dark footer.
 *
 * Light sections that touch a wiped dark section stay --cream-50 (the
 * body colour) so the clip-path wedge reveals the same tone - see the
 * note in globals.css.
 */
export default async function BranchHomePage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  const [aggregate, reviews] = await Promise.all([
    getReviewAggregate(branch),
    getApprovedReviews(branch, 5),
  ]);

  return (
    <>
      <JsonLd schema={bakerySchema(branchInfo, aggregate, reviews)} />
      <Hero branchInfo={branchInfo} />
      <CategoryGrid branchInfo={branchInfo} />
      <Bestsellers branchInfo={branchInfo} />
      <CustomCakesSection branchInfo={branchInfo} />
      <WhySweetBites branchInfo={branchInfo} />
      <ReviewsPreview branchInfo={branchInfo} />
      <LocationHours branchInfo={branchInfo} />
    </>
  );
}
