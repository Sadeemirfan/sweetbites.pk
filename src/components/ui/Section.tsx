import { cn } from "@/lib/utils/cn";

type SectionProps = {
  children: React.ReactNode;
  /**
   * "morning kitchen" rhythm (§2.2) - cream dominant, dark sections as
   * punctuation. `cream-alt` is only for a light section sitting between
   * two other light sections; a light section touching a wiped dark one
   * must stay `cream`, so the clip-path wedge reveals the same tone.
   *
   * The wipe itself is cut into the dark sections (see globals.css) -    * those are written as plain <section> elements because each carries
   * its own two-column layout and padding compensation.
   */
  tone?: "cream" | "cream-alt" | "dark";
  className?: string;
  id?: string;
};

const TONE_CLASSES = {
  cream: "bg-cream-50 text-ink",
  "cream-alt": "bg-cream-100 text-ink",
  dark: "bg-rosewood-d text-cream-100",
} as const;

export function Section({ children, tone = "cream", className, id }: SectionProps) {
  return (
    <section id={id} className={cn(TONE_CLASSES[tone], "py-12 md:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>
    </section>
  );
}

/** Eyebrow + heading + optional lead paragraph, consistently spaced. */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  tone = "cream",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  tone?: "cream" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  const onDark = tone === "dark";
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <span className={cn("eyebrow", onDark ? "text-cream-200" : "text-rosewood")}>
          {eyebrow}
        </span>
      ) : null}
      <h2 className={cn("text-xl md:text-2xl", onDark ? "text-cream-50" : "text-ink")}>{title}</h2>
      {lead ? (
        <p
          className={cn(
            "max-w-2xl text-base",
            onDark ? "text-cream-200" : "text-ink/70",
            align === "center" && "mx-auto"
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
