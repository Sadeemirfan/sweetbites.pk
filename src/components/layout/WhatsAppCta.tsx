import { cn } from "@/lib/utils/cn";
import { whatsappLink } from "@/lib/utils/whatsapp";

type WhatsAppCtaProps = {
  whatsappNumber: string;
  message: string;
  className?: string;
  label?: string;
  /** "ghee" for the header CTA (brand gold); "whatsapp" for buttons that
   * lean on the familiar WhatsApp green as a usability cue. */
  tone?: "ghee" | "whatsapp";
};

const TONE_CLASSES = {
  ghee: "bg-ghee hover:bg-ghee/90",
  whatsapp: "bg-whatsapp hover:bg-whatsapp/90",
} as const;

export function WhatsAppCta({
  whatsappNumber,
  message,
  className,
  label = "Order on WhatsApp",
  tone = "ghee",
}: WhatsAppCtaProps) {
  return (
    <a
      href={whatsappLink(whatsappNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        // no display utility here - callers own it (e.g. "hidden md:inline-flex")
        // so it can't lose a specificity tie against a hardcoded default.
        "min-h-11 items-center justify-center rounded-md px-5 text-sm font-medium text-cream-50 transition-colors",
        TONE_CLASSES[tone],
        className
      )}
    >
      {label}
    </a>
  );
}
