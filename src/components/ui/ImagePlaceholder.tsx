import { cn } from "@/lib/utils/cn";

/**
 * Stand-in for catalogue photography, which the client still owes us
 * (§17 - "this is 60% of whether the site looks premium"). It is drawn,
 * not a grey box: a warm cream panel with a line-drawn cake mark, so a
 * photo-less catalogue reads as deliberate rather than broken. Swap the
 * moment real images land in Supabase Storage.
 */
export function ImagePlaceholder({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-cream-100",
        className
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 11px, var(--cream-200) 11px 12px)",
        }}
      />
      <svg
        viewBox="0 0 64 64"
        className="relative h-14 w-14 text-rosewood/35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 52h40V36c0-2-1.6-3.6-3.6-3.6H15.6C13.6 32.4 12 34 12 36v16Z" />
        <path d="M12 42c3 0 3-2.4 6-2.4s3 2.4 6 2.4 3-2.4 6-2.4 3 2.4 6 2.4 3-2.4 6-2.4 3 2.4 6 2.4" />
        <path d="M32 32.4V24" />
        <path d="M32 24c-2.2 0-4-1.6-4-3.6 0-2.6 4-6.4 4-6.4s4 3.8 4 6.4c0 2-1.8 3.6-4 3.6Z" />
        <path d="M8 52h48" />
      </svg>
      {label ? (
        <span className="eyebrow absolute bottom-3 left-0 right-0 text-center text-rosewood/45">
          {label}
        </span>
      ) : null}
    </div>
  );
}
