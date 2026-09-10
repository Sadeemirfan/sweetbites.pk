import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getApprovedReviews } from "@/lib/supabase/queries";
import type { BranchInfo } from "@/lib/branches";

export async function ReviewsPreview({ branchInfo }: { branchInfo: BranchInfo }) {
  const reviews = await getApprovedReviews(branchInfo.slug, 3);

  return (
    <Section tone="cream">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeader eyebrow="Reviews" title={`What ${branchInfo.city} says`} />
        <ButtonLink variant="outline" href={`/${branchInfo.slug}/reviews`}>
          Read all reviews
        </ButtonLink>
      </div>

      <div className="mt-10">
        {reviews.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviews published yet"
            body="If we've made a cake for you, we'd like to hear how it went - it takes a minute."
            action="none"
          />
        )}
      </div>
    </Section>
  );
}
