"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Trash2, Undo2 } from "lucide-react";
import { deleteReview, setReviewApproval } from "@/app/admin/actions";
import { Rating } from "@/components/ui/Rating";
import { formatShortDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type Review = {
  id: string;
  customerName: string | null;
  rating: number | null;
  body: string | null;
  imageUrl: string | null;
  isApproved: boolean;
  createdAt: string;
};

export function ReviewsManager({ reviews }: { reviews: Review[] }) {
  const [items, setItems] = useState(reviews);
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"waiting" | "approved">("waiting");

  const waiting = items.filter((review) => !review.isApproved);
  const approved = items.filter((review) => review.isApproved);
  const shown = tab === "waiting" ? waiting : approved;

  function approve(id: string, value: boolean) {
    setItems((current) =>
      current.map((review) => (review.id === id ? { ...review, isApproved: value } : review))
    );
    startTransition(async () => {
      const result = await setReviewApproval(id, value);
      if (result.ok) toast.success(value ? "Published" : "Hidden from the site");
      else toast.error(result.message);
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;

    startTransition(async () => {
      const result = await deleteReview(id);
      if (result.ok) {
        setItems((current) => current.filter((review) => review.id !== id));
        toast.success("Deleted");
      } else toast.error(result.message);
    });
  }

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-90")}>
      <div className="flex gap-2">
        {(
          [
            ["waiting", `Waiting (${waiting.length})`],
            ["approved", `On the site (${approved.length})`],
          ] as const
        ).map(([value, text]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={cn(
              "min-h-11 flex-1 rounded-md border px-3 text-sm transition-colors",
              tab === value
                ? "border-rosewood bg-rosewood/10 font-medium text-ink"
                : "border-cream-200 bg-cream-50 text-ink/70"
            )}
          >
            {text}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
          {tab === "waiting"
            ? "Nothing waiting for approval. New reviews from the website land here first."
            : "No reviews published yet. Approve one and it appears on the site straight away."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((review) => (
            <li
              key={review.id}
              className="flex flex-col gap-2 rounded-md border border-cream-200 bg-cream-50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {review.customerName || "Anonymous"}
                  </p>
                  <p className="text-xs text-ink/50">
                    {formatShortDate(new Date(review.createdAt))}
                  </p>
                </div>
                <Rating value={review.rating} />
              </div>

              {review.body ? (
                <p className="text-sm leading-relaxed text-ink/80">{review.body}</p>
              ) : null}

              {review.imageUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-md">
                  <Image
                    src={review.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="flex gap-2 border-t border-cream-200 pt-2">
                {review.isApproved ? (
                  <button
                    type="button"
                    onClick={() => approve(review.id, false)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-cream-200 text-sm text-ink"
                  >
                    <Undo2 className="h-4 w-4" />
                    Take off the site
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => approve(review.id, true)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-rosewood text-sm font-medium text-cream-50"
                  >
                    <Check className="h-4 w-4" />
                    Publish
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(review.id)}
                  aria-label="Delete review"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-cream-200 text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
