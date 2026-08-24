/**
 * Prices are always shown, never hidden behind "contact for price"
 * (PLAN.md §9). Grouping is pinned to en-US so the separator is a plain
 * thousands comma everywhere - en-PK switches to lakh/crore grouping in
 * some ICU builds, which would render Rs. 16,500 as Rs. 16,500 locally
 * but Rs. 1,65,00 style groupings at higher values.
 */
const priceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `Rs. ${priceFormatter.format(value)}`;
}

/** "Tuesday, 25 August" - the phrasing PLAN.md §8 uses for lead time. */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Karachi",
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(date);
}
