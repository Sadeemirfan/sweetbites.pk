"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { submitReview, type ReviewFormState } from "@/app/(public)/reviews/actions";
import { MotionField } from "@/components/motion/MotionField";
import { cn } from "@/lib/utils/cn";

const INITIAL: ReviewFormState = { status: "idle", message: "" };

export function ReviewForm() {
  const [state, formAction, isPending] = useActionState(submitReview, INITIAL);
  const [rating, setRating] = useState(5);
  // State, not a ref: the value has to reach the hidden input's rendered
  // markup, and a ref mutation doesn't re-render - which would leave the
  // field at 0 and make the server reject every submission.
  const [startedAt, setStartedAt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Stamped on the client at mount so the server can reject submissions
  // that arrive impossibly fast.
  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-5 rounded-lg border border-cream-200 bg-cream-100 p-5 md:p-6"
    >
      <input type="hidden" name="started_at" value={startedAt} />

      {/* Honeypot - hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* §14 - label rises on focus, --ghee ring, one 150ms shake when
          an error appears. */}
      <MotionField
        label="Your name"
        name="customer_name"
        type="text"
        required
        maxLength={80}
        error={state.status === "error" ? state.message : null}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-ink">Your rating</legend>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
              aria-pressed={star === rating}
              className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-cream-200/60"
            >
              <svg
                viewBox="0 0 20 20"
                className={cn("h-6 w-6", star <= rating ? "text-rosewood" : "text-cream-200")}
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 1.6l2.47 5.2 5.53.78-4 4.06.95 5.76L10 14.7l-4.95 2.7.95-5.76-4-4.06 5.53-.78L10 1.6Z" />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>

      <MotionField
        label="How was your cake?"
        name="body"
        multiline
        required
        maxLength={1500}
      />

      {state.status === "success" ? (
        <p role="status" className="text-sm text-pista">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Sending…" : "Send review"}
      </Button>

      <p className="text-xs text-ink/55">
        Reviews are checked before they appear, so yours won&apos;t show up straight away.
      </p>
    </form>
  );
}
