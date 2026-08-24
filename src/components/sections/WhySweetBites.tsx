import { Section, SectionHeader } from "@/components/ui/Section";

const POINTS = [
  {
    title: "Made to order",
    body: "Nothing is pre-made. Your cake starts after you place the order, which is why it tastes fresh rather than stocked.",
  },
  {
    title: "No preservatives",
    body: "Real cream, real butter, nothing added to extend shelf life. Best eaten within two days of delivery.",
  },
  {
    title: "Free delivery in Arifwala",
    body: "Anywhere inside the city, at no charge, up to 10:00 PM. Nearby villages are delivered for a small fee.",
  },
  {
    title: "Open seven days",
    body: "8:00 AM to 10:00 PM, every day of the week, including Sundays and public holidays.",
  },
];

export function WhySweetBites() {
  return (
    <Section tone="cream">
      <SectionHeader
        eyebrow="Why Sweet Bites"
        title="A home kitchen, not a bakery counter"
        lead="We are a small kitchen in Gulshan-e-Wahab. Everything below is a consequence of that, not a marketing line."
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {POINTS.map((point) => (
          <div
            key={point.title}
            className="flex flex-col gap-2 border-t border-cream-200 pt-5"
          >
            <h3 className="text-lg text-ink">{point.title}</h3>
            <p className="text-base text-ink/70">{point.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
