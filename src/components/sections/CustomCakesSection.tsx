import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/Section";
import type { BranchInfo } from "@/lib/branches";
import { SHOWCASE_IMAGES } from "@/lib/showcase";
import { whatsappLink } from "@/lib/utils/whatsapp";

export function CustomCakesSection({ branchInfo }: { branchInfo: BranchInfo }) {
  const message = `Assalam-o-Alaikum ${branchInfo.name}\n\nI'd like to ask about a custom cake.\n\nSent from sweetbites.pk`;
  const hasShowcase = SHOWCASE_IMAGES[branchInfo.slug].length > 0;

  return (
    <section className="wipe-tb bg-rosewood-d py-[calc(var(--wipe-h)+3rem)] text-cream-100 md:py-[calc(var(--wipe-h)+5rem)]">
      <div className="mx-auto w-full max-w-2xl px-4 text-center md:px-6">
        <div className="flex flex-col items-center gap-6">
          <SectionHeader
            eyebrow="Custom cakes"
            title="Bring us a picture, we'll quote it"
            lead="Theme cakes, tiered cakes, and anything not in the gallery. Message us the occasion and your budget on WhatsApp, and we'll come back with a price. Extra customization means extra charges - we'll always tell you the exact amount before you confirm."
            tone="dark"
            align="center"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink
              variant="whatsapp"
              href={whatsappLink(branchInfo.whatsappNumber, message)}
              external
            >
              <WhatsAppIcon />
              Ask about a custom cake
            </ButtonLink>
            {hasShowcase ? (
              <ButtonLink variant="outline-dark" href={`/${branchInfo.slug}/our-work`}>
                See our work
              </ButtonLink>
            ) : null}
          </div>
          <p className="text-sm text-cream-200">
            Custom work needs at least three days. Five or more for elaborate designs.
          </p>
        </div>
      </div>
    </section>
  );
}
