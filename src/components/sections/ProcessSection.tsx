import { SectionHeader } from "@/components/ui/Section";

/**
 * How a cake is made, in four steps.
 *
 * This began as the §2.5 scroll-assembly, where an R3F cake built itself
 * layer by layer as you scrolled. The owner removed the 3D, then the
 * photograph that replaced it, so the section is now type alone.
 *
 * With no image to sit beside, the steps spread across the full width
 * instead of stacking in a narrow column against dead space - four
 * across on desktop, two up on tablet, one on a phone.
 */
const STEPS = [
  {
    title: "Ingredients bought that morning",
    body: "Flour, cream, and fruit come from the bazaar the day we bake, not from a storeroom.",
  },
  {
    title: "Cream whipped by hand",
    body: "Buttercream is whipped in small batches, so it stays light instead of stiff and sugary.",
  },
  {
    title: "No preservatives",
    body: "Nothing goes in to make it last a week, because it is not meant to sit for a week.",
  },
  {
    title: "Ready on your date",
    body: "It is finished and boxed the morning it is due, and it reaches you the same day.",
  },
];

export function ProcessSection() {
  return (
    <section className="wipe-b bg-rosewood-d pb-[calc(var(--wipe-h)+4rem)] pt-16 text-cream-100 md:pb-[calc(var(--wipe-h)+6rem)] md:pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeader
          eyebrow="How your cake is made"
          title="Built layer by layer, the day it's due"
          lead="Four steps, every time. It is the same process whether the cake is one pound or fifteen."
          tone="dark"
        />

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2 border-t border-cream-100/15 pt-5">
              {/* rosewood reads fine on cream but nearly disappears on
                  rosewood-d - cream-200 keeps it visible here. */}
              <span className="eyebrow text-cream-200">Step {index + 1}</span>
              <h3 className="text-lg text-cream-50">{step.title}</h3>
              <p className="text-sm leading-relaxed text-cream-200">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
