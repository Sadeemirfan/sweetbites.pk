import Image from "next/image";
import { Rating } from "@/components/ui/Rating";
import { formatShortDate } from "@/lib/utils/format";
import type { ReviewRow } from "@/types/catalogue";

export function ReviewCard({ review }: { review: ReviewRow }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-lg border border-cream-200 bg-cream-50 p-5 shadow-cream">
      <Rating value={review.rating} />

      {review.body ? (
        <blockquote className="flex-1 text-base leading-relaxed text-ink/80">
          “{review.body}”
        </blockquote>
      ) : null}

      {review.image_url ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
          <Image
            src={review.image_url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <figcaption className="flex flex-col gap-0.5 border-t border-cream-200 pt-3">
        <span className="text-sm font-medium text-ink">
          {review.customer_name?.trim() || "Sweet Bites customer"}
        </span>
        <span className="text-xs text-ink/55">
          {formatShortDate(new Date(review.created_at))}
        </span>
      </figcaption>
    </figure>
  );
}
