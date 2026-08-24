import { Section, SectionHeader } from "@/components/ui/Section";

/**
 * §8: the lead time is presented as a promise, never hidden as a
 * disclaimer. These four steps turn the objection into the reason to
 * order.
 */
const STEPS = [
  {
    day: "Day 1 - morning",
    title: "We shop for your cake",
    body: "Cream, fruit, and anything specific to your order is bought that morning. Nothing comes out of storage.",
  },
  {
    day: "Day 1 - evening",
    title: "Sponge is baked and cooled",
    body: "Sponge needs to rest overnight before it can be layered, or it tears and soaks unevenly.",
  },
  {
    day: "Day 2 - morning",
    title: "Filled, frosted, decorated",
    body: "Buttercream is whipped fresh and the cake is assembled and finished by hand.",
  },
  {
    day: "Day 2 - your slot",
    title: "Boxed and delivered",
    body: "It leaves the kitchen in the time slot you picked, on the date you asked for.",
  },
];

export function WhyTwoDays() {
  return (
    <Section tone="cream-alt">
      <SectionHeader
        eyebrow="Why two days"
        title="The wait is the recipe"
        lead="A cake that is ready in an hour was made before you asked for it. Here is where the two days actually go."
      />

      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-rosewood text-sm font-medium text-cream-50">
                {index + 1}
              </span>
              <span className="eyebrow text-rosewood-d">{step.day}</span>
            </div>
            <h3 className="mt-1 text-lg text-ink">{step.title}</h3>
            <p className="text-base text-ink/70">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
