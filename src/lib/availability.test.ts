import { describe, expect, it } from "vitest";
import {
  addDays,
  buildMonthGrid,
  checkDate,
  earliestDate,
  earliestDateForLeadTimes,
  firstAvailableDate,
  fromISODate,
  isAfterCutoff,
  maxLeadTime,
  toISODate,
} from "@/lib/availability";

/**
 * Times are written as UTC instants and asserted against Asia/Karachi
 * (UTC+5, no DST) day boundaries. 12:00Z is 17:00 PKT - before the 6 PM
 * cutoff; 13:30Z is 18:30 PKT - after it.
 */
const BEFORE_CUTOFF = new Date("2026-08-22T12:00:00Z"); // Sat 17:00 PKT
const AFTER_CUTOFF = new Date("2026-08-22T13:30:00Z"); // Sat 18:30 PKT
const LATE_UTC_NEXT_DAY_PKT = new Date("2026-08-22T20:00:00Z"); // Sun 01:00 PKT

describe("timezone handling", () => {
  it("treats 17:00 PKT as before the 6 PM cutoff", () => {
    expect(isAfterCutoff(BEFORE_CUTOFF)).toBe(false);
  });

  it("treats 18:30 PKT as after the 6 PM cutoff", () => {
    expect(isAfterCutoff(AFTER_CUTOFF)).toBe(true);
  });

  it("rolls the day over on Arifwala midnight, not UTC midnight", () => {
    // 20:00Z on the 22nd is already 01:00 on the 23rd in Arifwala, so
    // the two-day floor is the 25th rather than the 24th.
    expect(toISODate(earliestDate(2, LATE_UTC_NEXT_DAY_PKT))).toBe("2026-08-25");
  });
});

describe("earliestDate - §8 rules 1 and 2", () => {
  it("adds the standard two days before the cutoff", () => {
    expect(toISODate(earliestDate(2, BEFORE_CUTOFF))).toBe("2026-08-24");
  });

  it("adds one extra day after the 6 PM cutoff", () => {
    expect(toISODate(earliestDate(2, AFTER_CUTOFF))).toBe("2026-08-25");
  });

  it("honours a three-day lead time for custom and tiered cakes", () => {
    expect(toISODate(earliestDate(3, BEFORE_CUTOFF))).toBe("2026-08-25");
  });

  it("defaults to two days when no lead time is given", () => {
    expect(toISODate(earliestDate(undefined, BEFORE_CUTOFF))).toBe("2026-08-24");
  });

  it("never returns a same-day or next-day date", () => {
    for (const now of [BEFORE_CUTOFF, AFTER_CUTOFF, LATE_UTC_NEXT_DAY_PKT]) {
      const earliest = toISODate(earliestDate(2, now));
      const todayIso = toISODate(now);
      expect(earliest > todayIso).toBe(true);
      expect(earliest > toISODate(addDays(fromISODate(todayIso), 1))).toBe(true);
    }
  });
});

describe("maxLeadTime - §8 rule 1 across a mixed cart", () => {
  it("takes the slowest item in the cart", () => {
    expect(maxLeadTime([2, 3, 2])).toBe(3);
  });

  it("falls back to the standard lead time for an empty cart", () => {
    expect(maxLeadTime([])).toBe(2);
  });

  it("dates a mixed cart by its slowest item", () => {
    expect(toISODate(earliestDateForLeadTimes([2, 2, 3], BEFORE_CUTOFF))).toBe("2026-08-25");
  });
});

describe("checkDate - reasons, never silent", () => {
  it("rejects a date inside the lead-time window with the day count", () => {
    const result = checkDate(fromISODate("2026-08-23"), { now: BEFORE_CUTOFF });
    expect(result).toEqual({ available: false, reason: "Needs 2 days" });
  });

  it("reports the admin's own reason for a blackout date", () => {
    const result = checkDate(fromISODate("2026-08-26"), {
      now: BEFORE_CUTOFF,
      blackouts: [{ date: "2026-08-26", reason: "Eid holiday" }],
    });
    expect(result).toEqual({ available: false, reason: "Eid holiday" });
  });

  it("falls back to 'Closed' for a blackout with no stated reason", () => {
    const blank = checkDate(fromISODate("2026-08-26"), {
      now: BEFORE_CUTOFF,
      blackouts: [{ date: "2026-08-26", reason: "   " }],
    });
    expect(blank).toEqual({ available: false, reason: "Closed" });
  });

  it("rejects a weekday the shop is closed", () => {
    // 2026-08-30 is a Sunday.
    const result = checkDate(fromISODate("2026-08-30"), {
      now: BEFORE_CUTOFF,
      closedWeekdays: [0],
    });
    expect(result).toEqual({ available: false, reason: "Closed" });
  });

  it("accepts a date past the lead time with nothing blocking it", () => {
    expect(checkDate(fromISODate("2026-08-24"), { now: BEFORE_CUTOFF })).toEqual({
      available: true,
    });
  });

  it("is open all seven days by default - §0", () => {
    // A full week starting past the lead-time floor, no closedWeekdays.
    for (let i = 0; i < 7; i += 1) {
      const date = addDays(fromISODate("2026-08-24"), i);
      expect(checkDate(date, { now: BEFORE_CUTOFF }).available).toBe(true);
    }
  });
});

describe("no capacity-based blocking - §8 rule 4", () => {
  it("exposes no capacity or order-count input at all", () => {
    // The guarantee is structural: there is nowhere to pass an order
    // count, so the system cannot auto-disable a busy date even by
    // mistake. Only the admin blocks a date, and only via blackouts.
    const busyDay = fromISODate("2026-08-24");
    const options = { now: BEFORE_CUTOFF };
    expect(checkDate(busyDay, options).available).toBe(true);

    const optionKeys = Object.keys({
      leadTimeDays: 2,
      blackouts: [],
      closedWeekdays: [],
      now: BEFORE_CUTOFF,
    });
    expect(optionKeys).not.toContain("capacity");
    expect(optionKeys).not.toContain("maxOrders");
    expect(optionKeys).not.toContain("orderCount");
  });

  it("stays available no matter how many times the same date is checked", () => {
    const date = fromISODate("2026-08-24");
    for (let i = 0; i < 50; i += 1) {
      expect(checkDate(date, { now: BEFORE_CUTOFF }).available).toBe(true);
    }
  });
});

describe("firstAvailableDate", () => {
  it("returns the lead-time floor when nothing blocks it", () => {
    expect(toISODate(firstAvailableDate({ now: BEFORE_CUTOFF }))).toBe("2026-08-24");
  });

  it("skips past consecutive blackout dates", () => {
    const result = firstAvailableDate({
      now: BEFORE_CUTOFF,
      blackouts: [
        { date: "2026-08-24", reason: "Closed" },
        { date: "2026-08-25", reason: "Closed" },
      ],
    });
    expect(toISODate(result)).toBe("2026-08-26");
  });

  it("skips a closed weekday", () => {
    // Floor is Mon 24th; closing Mondays pushes it to Tue 25th.
    const result = firstAvailableDate({ now: BEFORE_CUTOFF, closedWeekdays: [1] });
    expect(toISODate(result)).toBe("2026-08-25");
  });
});

describe("buildMonthGrid", () => {
  const grid = buildMonthGrid(2026, 7, { now: BEFORE_CUTOFF }); // August 2026

  it("returns a six-week grid", () => {
    expect(grid).toHaveLength(42);
  });

  it("starts on a Sunday", () => {
    expect(grid[0].date.getUTCDay()).toBe(0);
  });

  it("marks padding days as outside the month", () => {
    const inMonth = grid.filter((day) => day.inMonth);
    expect(inMonth).toHaveLength(31);
    expect(inMonth[0].dayOfMonth).toBe(1);
  });

  it("carries a reason on every unavailable day", () => {
    for (const day of grid) {
      if (!day.availability.available) {
        expect(day.availability.reason.length).toBeGreaterThan(0);
      }
    }
  });
});
