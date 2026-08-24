import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Rating } from "@/components/ui/Rating";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ReviewForm } from "@/app/(public)/reviews/ReviewForm";
import { CountUp } from "@/components/motion/CountUp";
import { getApprovedReviews, getReviewAggregate } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Customer Reviews | Sweet Bites Arifwala",
  description:
    "Real reviews from Sweet Bites customers in Arifwala - birthday cakes, wedding cakes, and custom orders. Leave your own review.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const [reviews, aggregate] = await Promise.all([getApprovedReviews(), getReviewAggregate()]);

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Reviews" }]} />

      <SectionHeader
        eyebrow="Reviews"
        title="What Arifwala says"
        lead="Every review below is from a real order. We publish the honest ones too."
      />

      {/* §14 - the one genuine stat on the public site, so it's where
          the count-up belongs. No stats section was invented for it. */}
      {aggregate ? (
        <div className="mt-6 flex items-center gap-3">
          <Rating value={Math.round(aggregate.average)} />
          <p className="text-sm text-ink/70">
            <CountUp value={aggregate.average} decimals={1} className="font-medium text-ink" /> out
            of 5 from <CountUp value={aggregate.count} className="font-medium text-ink" />{" "}
            {aggregate.count === 1 ? "review" : "reviews"}
          </p>
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          {reviews.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reviews published yet"
              body="Nothing has been approved for the site yet. If we've baked for you, yours could be the first."
              action="none"
            />
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg text-ink">Leave a review</h2>
          <ReviewForm />
        </div>
      </div>
    </Section>
  );
}
