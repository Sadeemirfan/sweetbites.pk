import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/Section";

const EXAMPLES = [
  { title: "Tiered wedding cakes", note: "Two and three tier, 5–15 pound" },
  { title: "Fondant character cakes", note: "Send a picture, we model it" },
  { title: "Number & letter cakes", note: "Any age, any initial" },
  { title: "Corporate & bulk orders", note: "Logos, launches, staff events" },
];

export function CustomCakesSection() {
  return (
    <section className="wipe-tb bg-rosewood-d py-[calc(var(--wipe-h)+3rem)] text-cream-100 md:py-[calc(var(--wipe-h)+5rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <div className="flex flex-col items-start gap-6">
            <SectionHeader
              eyebrow="Custom cakes"
              title="Bring us a picture, we'll quote it"
              lead="Theme cakes, tiered cakes, and anything not in the gallery. Tell us the occasion and your budget, and we'll come back with a price on WhatsApp."
              tone="dark"
            />
            <ButtonLink variant="primary" href="/custom-cake">
              Start a custom request
            </ButtonLink>
            <p className="text-sm text-cream-200">
              Custom work needs at least three days. Five or more for elaborate designs.
            </p>
          </div>

          {/*
            §9 calls for a past-work carousel here. Held until the client
            supplies the 8–12 custom cake photos listed in §17 - a
            carousel of placeholders would be worse than this list, which
            at least tells the customer what we actually make.
          */}
          <ul className="grid gap-3 sm:grid-cols-2">
            {EXAMPLES.map((example) => (
              <li
                key={example.title}
                className="flex flex-col gap-1 rounded-lg border border-cream-100/15 bg-cream-50/8 p-4"
              >
                <h3 className="text-base text-cream-50">{example.title}</h3>
                <p className="text-sm text-cream-200">{example.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
