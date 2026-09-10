import { WhatsAppIcon } from "@/components/ui/Button";
import { HeroWords } from "@/components/motion/HeroWords";
import { MagneticLink } from "@/components/motion/MagneticButton";
import { earliestDate } from "@/lib/availability";
import { formatLongDate } from "@/lib/utils/format";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";
import type { BranchInfo } from "@/lib/branches";

/**
 * Type-only hero, at the owner's direction: no logo, no 3D cake, no
 * photograph.
 *
 * With nothing to sit beside, the two-column grid is gone and the words
 * carry the section on their own - which means they have to be set
 * properly rather than left hugging one edge of an empty row. The
 * headline moves up the §2.4 scale now that it has the full measure, and
 * the whole block is centred and given real vertical room so the
 * emptiness reads as confidence rather than as something failing to
 * load.
 */
export function Hero({ branchInfo }: { branchInfo: BranchInfo }) {
  // Live earliest-date line (§9) - recomputed per request, and it
  // already respects the branch's 6 PM cutoff from §8.
  const readyDate = formatLongDate(earliestDate());

  return (
    // Dark rosewood - the same brand tone already used in the "Custom
    // Cakes" band and the footer, not a separate hero-only colour. wipe-b
    // gives it the same angled edge into the section below (§14) that
    // every other dark band on the site already uses.
    <section className="wipe-b relative overflow-hidden bg-rosewood-d text-cream-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-7 px-4 pb-[calc(6rem+var(--wipe-h))] pt-24 text-center md:px-6 md:pb-[calc(8rem+var(--wipe-h))] md:pt-32">
        <span className="eyebrow text-cream-200">Made to order in {branchInfo.city}</span>

        <h1 className="text-3xl text-cream-50">
          <HeroWords text={branchInfo.tagline} />
        </h1>

        <p className="max-w-xl text-base text-cream-200 md:text-lg">
          Every cake is baked after you order it. Nothing is pre-made, nothing sits in a display
          case. That is why it takes two days, and why it tastes like it does.
        </p>

        {/* §14 - the two hero CTAs are the magnetic buttons. */}
        <div className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <MagneticLink
            href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
            external
            fillClassName="bg-[#04301A]/15"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-6 text-base font-medium text-[#04301A] sm:w-auto"
          >
            <WhatsAppIcon />
            Order on WhatsApp
          </MagneticLink>
          <MagneticLink
            href={`/${branchInfo.slug}/gallery`}
            fillClassName="bg-cream-100/10"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-cream-100/30 px-6 text-base font-medium text-cream-50 sm:w-auto"
          >
            Browse the gallery
          </MagneticLink>
        </div>

        {/* Centred, so a left rule would hang off nothing - a hairline
            above it does the separating instead. */}
        <p className="mt-4 border-t border-cream-100/15 pt-5 text-sm text-cream-200">
          The earliest we can have your cake ready is{" "}
          <span className="text-cream-50">{readyDate}</span>.
        </p>
      </div>
    </section>
  );
}
