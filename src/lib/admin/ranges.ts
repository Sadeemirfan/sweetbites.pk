import { addDays, toISODate, today } from "@/lib/availability";

/**
 * Report ranges - §13.3. Custom is a first-class option, not an
 * afterthought: it is how the baker checks one wedding week or a
 * festival period.
 *
 * Every boundary is an Asia/Karachi calendar day, reusing the same
 * noon-anchored date helpers as the lead-time logic so a report never
 * disagrees with the order list about which day something belongs to.
 */
export type RangeKey =
  | "today"
  | "yesterday"
  | "last7"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 days" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "thisYear", label: "This year" },
  { key: "custom", label: "Custom range" },
];

export type DateRange = { from: string; to: string; label: string; key: RangeKey };

function monthStart(date: Date, offset = 0): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1, 12));
}

function monthEnd(date: Date, offset = 0): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset + 1, 0, 12));
}

export function resolveRange(
  key: RangeKey,
  custom?: { from?: string; to?: string },
  now: Date = new Date()
): DateRange {
  const base = today(now);
  const label = RANGE_OPTIONS.find((option) => option.key === key)?.label ?? "Range";

  switch (key) {
    case "today":
      return { key, label, from: toISODate(base), to: toISODate(base) };

    case "yesterday": {
      const day = addDays(base, -1);
      return { key, label, from: toISODate(day), to: toISODate(day) };
    }

    case "last7":
      // Inclusive of today, so "last 7 days" is 7 days of data.
      return { key, label, from: toISODate(addDays(base, -6)), to: toISODate(base) };

    case "thisMonth":
      return { key, label, from: toISODate(monthStart(base)), to: toISODate(monthEnd(base)) };

    case "lastMonth":
      return {
        key,
        label,
        from: toISODate(monthStart(base, -1)),
        to: toISODate(monthEnd(base, -1)),
      };

    case "thisYear":
      return {
        key,
        label,
        from: toISODate(new Date(Date.UTC(base.getUTCFullYear(), 0, 1, 12))),
        to: toISODate(new Date(Date.UTC(base.getUTCFullYear(), 11, 31, 12))),
      };

    case "custom": {
      const from = custom?.from && /^\d{4}-\d{2}-\d{2}$/.test(custom.from) ? custom.from : null;
      const to = custom?.to && /^\d{4}-\d{2}-\d{2}$/.test(custom.to) ? custom.to : null;
      // Fall back to this month rather than erroring on a half-typed range.
      if (!from || !to) {
        return { key, label, from: toISODate(monthStart(base)), to: toISODate(monthEnd(base)) };
      }
      return from <= to
        ? { key, label, from, to }
        : { key, label, from: to, to: from };
    }
  }
}

/** Every calendar day in the range, for bucketing the chart. */
export function eachDay(range: DateRange): string[] {
  const days: string[] = [];
  let cursor = new Date(`${range.from}T12:00:00Z`);
  const end = new Date(`${range.to}T12:00:00Z`);

  // Guard against a pathological custom range dragging the page down.
  while (cursor <= end && days.length < 400) {
    days.push(toISODate(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function rangeLengthDays(range: DateRange): number {
  const from = new Date(`${range.from}T12:00:00Z`).getTime();
  const to = new Date(`${range.to}T12:00:00Z`).getTime();
  return Math.round((to - from) / 86400000) + 1;
}

/**
 * §13.3 - "Monthly net is meaningful; anything shorter is not." Drives
 * the caveat shown beside the net figure. 28 days rather than 30 so a
 * four-week custom range doesn't get flagged on a technicality.
 */
export function isShortRange(range: DateRange): boolean {
  return rangeLengthDays(range) < 28;
}
