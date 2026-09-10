import Image from "next/image";

const LOGO_ASPECT_RATIO = 1167 / 654;

// The source art is low-res (upscaled from a 447x447 original) - never
// render past this width or it visibly softens.
const MAX_WIDTH = 300;

type LogoProps = {
  /** "rosewood" for cream/light surfaces, "cream" for dark sections. */
  variant?: "rosewood" | "cream";
  width?: number;
  className?: string;
  priority?: boolean;
  /** Same mark across all three branches - only the alt text names the
      specific shop, for accessibility and SEO. */
  alt?: string;
};

export function Logo({
  variant = "rosewood",
  width = 160,
  className,
  priority,
  alt = "Sweet Bites",
}: LogoProps) {
  const clampedWidth = Math.min(width, MAX_WIDTH);
  const src = variant === "cream" ? "/logo-cream.png" : "/logo-transparent.png";

  return (
    <Image
      src={src}
      alt={alt}
      width={clampedWidth}
      height={Math.round(clampedWidth / LOGO_ASPECT_RATIO)}
      priority={priority}
      className={className}
    />
  );
}
