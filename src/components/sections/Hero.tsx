import { WhatsAppIcon } from "@/components/ui/Button";
import { HeroWords } from "@/components/motion/HeroWords";
import { MagneticLink } from "@/components/motion/MagneticButton";
import { earliestDate } from "@/lib/availability";
import { formatLongDate } from "@/lib/utils/format";
import { DEFAULT_WHATSAPP_MESSAGE, whatsappLink } from "@/lib/utils/whatsapp";
import { BUSINESS } from "@/lib/constants";

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
export function Hero() {
  // Live earliest-date line (§9) - recomputed per request, and it
  // already respects the 6 PM Arifwala cutoff from §8.
  const readyDate = formatLongDate(earliestDate());

  return (
    // Light pink, so the section reads dark-on-light like the rest of the
    // site instead of light-on-dark - every child below flips accordingly.
    <section className="relative overflow-hidden bg-blush text-ink">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-7 px-4 py-24 text-center md:px-6 md:py-32">
        <span className="eyebrow text-rosewood">Made to order in Arifwala</span>

        <h1 className="text-3xl text-ink">
          <HeroWords text={BUSINESS.tagline} />
        </h1>

        <p className="max-w-xl text-base text-ink/75 md:text-lg">
          Every cake is baked after you order it. Nothing is pre-made, nothing sits in a display
          case. That is why it takes two days, and why it tastes like it does.
        </p>

        {/* §14 - the two hero CTAs are the magnetic buttons. */}
        <div className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <MagneticLink
            href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
            external
            fillClassName="bg-[#04301A]/15"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-6 text-base font-medium text-[#04301A] sm:w-auto"
          >
            <WhatsAppIcon />
            Order on WhatsApp
          </MagneticLink>
          <MagneticLink
            href="/gallery"
            fillClassName="bg-ink/8"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-ink/25 px-6 text-base font-medium text-ink sm:w-auto"
          >
            Browse the gallery
          </MagneticLink>
        </div>

        {/* Centred, so a left rule would hang off nothing - a hairline
            above it does the separating instead. */}
        <p className="mt-4 border-t border-ink/15 pt-5 text-sm text-ink/75">
          The earliest we can have your cake ready is{" "}
          <span className="text-rosewood-d">{readyDate}</span>.
        </p>
      </div>
    </section>
  );
}
