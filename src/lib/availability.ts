import { LEAD_TIME } from "@/lib/constants";

/**
 * Lead-time logic - PLAN.md §8. Every function here is pure: `now`,
 * blackout dates and closed weekdays all arrive as arguments rather than
 * being read from the clock or the database, so they are testable and
 * reusable. Phase 5 reuses them in warning-only mode for manual admin
 * entry (§13.1), which is why nothing here throws or blocks by itself -
 * it reports, and the caller decides what to do about it.
 *
 * There is deliberately NO capacity input anywhere in this file (§8
 * rule 4). Output ranges from 2 to 50+ cakes a day; only the admin
 * blocks a date, and only by hand.
 *
 * All day boundaries are Asia/Karachi. The shop is in Arifwala, so a
 * 6 PM cutoff evaluated in UTC would flip over in the early afternoon
 * local time and quietly promise the wrong date.
 */

export type BlackoutDate = { date: string; reason: string | null };

export type AvailabilityOptions = {
  leadTimeDays?: number;
  blackouts?: BlackoutDate[];
  /** Weekday numbers (0 = Sunday) the shop is closed. Currently none -    *  Sweet Bites is open all seven days (§0). */
  closedWeekdays?: number[];
  now?: Date;
  /**
   * Lets today through the lead-time floor when a slot with enough
   * same-day notice still exists (see `hasSameDaySlot`). Off by default -
   * custom-cake requests and manual admin entry don't get it, only the
   * regular checkout does.
   */
  allowSameDay?: boolean;
};

type KarachiNow = { year: number; month: number; day: number; hour: number };

function karachiNow(now: Date): KarachiNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    // en-GB renders midnight as "24" in some ICU versions.
    hour: get("hour") % 24,
  };
}

/**
 * A date anchored at 12:00 UTC. Noon-anchoring keeps `addDays` immune to
 * any offset arithmetic pushing a date across a day boundary, and makes
 * two dates comparable by their ISO day string alone.
 */
function dayFrom({ year, month, day }: KarachiNow): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** YYYY-MM-DD, the form `orders.required_date` and <input type="date"> use. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/** Today in Arifwala, as a noon-anchored date. */
export function today(now: Date = new Date()): Date {
  return dayFrom(karachiNow(now));
}

/** True when the order is being placed after the 6 PM cutoff (§8 rule 2). */
export function isAfterCutoff(now: Date = new Date()): boolean {
  return karachiNow(now).hour >= LEAD_TIME.cutoffHour;
}

/**
 * Same-day exception (owner's rule, added after launch): the standard
 * promise is still "two days", but a same-day order is taken too, as
 * long as the chosen slot starts at least this many hours from now.
 */
export const SAME_DAY_MIN_NOTICE_HOURS = 5;

/** 24-hour Asia/Karachi start time for each bookable slot. */
const SLOT_START_HOUR: Record<string, number> = {
  "10-1": 10,
  "1-4": 13,
  "4-7": 16,
  "7-10": 19,
  "after-10": 22,
};

/** True once `slotValue` starts with enough same-day notice from `now`. */
export function isSlotBookableToday(slotValue: string, now: Date = new Date()): boolean {
  const startHour = SLOT_START_HOUR[slotValue];
  if (startHour === undefined) return false;
  return startHour - karachiNow(now).hour >= SAME_DAY_MIN_NOTICE_HOURS;
}

/** True when at least one slot today still clears the same-day notice. */
export function hasSameDaySlot(now: Date = new Date()): boolean {
  return Object.keys(SLOT_START_HOUR).some((slot) => isSlotBookableToday(slot, now));
}

/**
 * §8 rule 1 + rule 2: today + lead days, plus one more day when the
 * order is placed after 6 PM, because ingredients are bought in the
 * morning.
 *
 * Note this does NOT skip blackout dates or closed weekdays - it is the
 * raw floor. `firstAvailableDate` walks forward from here.
 */
export function earliestDate(
  leadTimeDays: number = LEAD_TIME.standard,
  now: Date = new Date()
): Date {
  return addDays(today(now), leadTimeDays + (isAfterCutoff(now) ? 1 : 0));
}

/**
 * §8 rule 1 across a mixed cart - the slowest item sets the date for all
 * of them. An empty cart falls back to the standard lead time.
 */
export function maxLeadTime(leadTimeDays: number[]): number {
  return leadTimeDays.length ? Math.max(...leadTimeDays) : LEAD_TIME.standard;
}

export function earliestDateForLeadTimes(
  leadTimeDays: number[],
  now: Date = new Date()
): Date {
  return earliestDate(maxLeadTime(leadTimeDays), now);
}

export type DateAvailability =
  | { available: true }
  | { available: false; reason: string };

/**
 * §8 rules 3 and 4. A date is unavailable only because it is inside the
 * lead-time window, the shop is closed that weekday, or the admin
 * blacked it out - never because of how many orders that day already
 * holds. Every unavailable date carries a reason, because §8 requires
 * the UI to explain itself rather than disable silently.
 */
export function checkDate(date: Date, options: AvailabilityOptions = {}): DateAvailability {
  const {
    leadTimeDays = LEAD_TIME.standard,
    blackouts = [],
    closedWeekdays = [],
    now = new Date(),
    allowSameDay = false,
  } = options;

  const iso = toISODate(date);
  const isToday = iso === toISODate(today(now));
  const sameDayException = allowSameDay && isToday && hasSameDaySlot(now);

  if (iso < toISODate(earliestDate(leadTimeDays, now)) && !sameDayException) {
    return isToday
      ? { available: false, reason: `Needs ${SAME_DAY_MIN_NOTICE_HOURS} hours' notice` }
      : { available: false, reason: `Needs ${leadTimeDays} days` };
  }

  const blackout = blackouts.find((entry) => entry.date === iso);
  if (blackout) {
    return { available: false, reason: blackout.reason?.trim() || "Closed" };
  }

  if (closedWeekdays.includes(date.getUTCDay())) {
    return { available: false, reason: "Closed" };
  }

  return { available: true };
}

/**
 * The first date that actually passes every rule - the one the "earliest
 * we can have your cake ready" promise should quote. Walks forward from
 * the lead-time floor past any blackout or closed weekday.
 *
 * The 60-day ceiling is a loop guard, not a business rule; it only
 * matters if someone blacks out two solid months.
 */
export function firstAvailableDate(options: AvailabilityOptions = {}): Date {
  const { leadTimeDays = LEAD_TIME.standard, now = new Date() } = options;
  let candidate = earliestDate(leadTimeDays, now);

  for (let i = 0; i < 60; i += 1) {
    if (checkDate(candidate, options).available) return candidate;
    candidate = addDays(candidate, 1);
  }

  return candidate;
}

export type CalendarDay = {
  date: Date;
  iso: string;
  dayOfMonth: number;
  /** False for the leading/trailing days that pad the month grid. */
  inMonth: boolean;
  availability: DateAvailability;
};

/**
 * A six-row month grid starting on Sunday, with each day already
 * resolved to available/unavailable-with-reason so the picker can render
 * without repeating the rules.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  options: AvailabilityOptions = {}
): CalendarDay[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1, 12, 0, 0));
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      iso: toISODate(date),
      dayOfMonth: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month,
      availability: checkDate(date, options),
    };
  });
}
