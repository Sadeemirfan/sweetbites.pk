import { cn } from "@/lib/utils/cn";

/**
 * Stars are --rosewood, not --ghee. Gold stars are the conventional
 * choice, but §2.3 reserves --ghee strictly for prices and primary CTAs,
 * and spending it on decoration is exactly how that discipline erodes.
 */
export function Rating({ value, className }: { value: number | null; className?: string }) {
  const rating = Math.max(0, Math.min(5, value ?? 0));

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <span className="sr-only">{rating} out of 5 stars</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={cn("h-4 w-4", star <= rating ? "text-rosewood" : "text-cream-200")}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1.6l2.47 5.2 5.53.78-4 4.06.95 5.76L10 14.7l-4.95 2.7.95-5.76-4-4.06 5.53-.78L10 1.6Z" />
        </svg>
      ))}
    </div>
  );
}
