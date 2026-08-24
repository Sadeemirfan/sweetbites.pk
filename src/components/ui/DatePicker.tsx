"use client";

import { useMemo, useState } from "react";
import { buildMonthGrid, fromISODate, type BlackoutDate } from "@/lib/availability";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_FORMAT = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * §8: "Disabled dates show their reason on tap or hover ... Never
 * disable a date silently."
 *
 * Hover is handled by `title`, but that is useless on a phone - and
 * phones are the primary target - so tapping a disabled date puts its
 * reason in a live region under the grid instead of doing nothing.
 */
export function DatePicker({
  value,
  onChange,
  leadTimeDays,
  blackouts,
  closedWeekdays,
  minMonthDate,
}: {
  value: string | null;
  onChange: (iso: string) => void;
  leadTimeDays: number;
  blackouts: BlackoutDate[];
  closedWeekdays: number[];
  /** The month the picker opens on - normally the earliest valid date. */
  minMonthDate: Date;
}) {
  const [cursor, setCursor] = useState(() => ({
    year: minMonthDate.getUTCFullYear(),
    month: minMonthDate.getUTCMonth(),
  }));
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null);

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, { leadTimeDays, blackouts, closedWeekdays }),
    [cursor, leadTimeDays, blackouts, closedWeekdays]
  );

  const monthLabel = MONTH_FORMAT.format(new Date(Date.UTC(cursor.year, cursor.month, 1)));

  // Never let the customer page back to a month that is entirely in the
  // past - there is nothing selectable there.
  const canGoBack =
    cursor.year > minMonthDate.getUTCFullYear() ||
    (cursor.year === minMonthDate.getUTCFullYear() && cursor.month > minMonthDate.getUTCMonth());

  function step(delta: number) {
    setBlockedNotice(null);
    setCursor((current) => {
      const next = new Date(Date.UTC(current.year, current.month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  return (
    <div className="rounded-lg border border-cream-200 bg-cream-50 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 text-ink transition-colors hover:border-rosewood disabled:opacity-35"
        >
          ‹
        </button>
        <span aria-live="polite" className="text-base font-medium text-ink">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next month"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 text-ink transition-colors hover:border-rosewood"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, index) => (
          <div key={`${day}-${index}`} className="py-1 text-center text-xs text-ink/50">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((day) => {
          const isSelected = value === day.iso;
          const disabled = !day.availability.available;
          const reason = day.availability.available ? null : day.availability.reason;

          return (
            <button
              key={day.iso}
              type="button"
              // Deliberately not `disabled` - a disabled button is not
              // focusable and swallows taps, so the reason could never
              // be surfaced on a phone.
              aria-disabled={disabled}
              aria-pressed={isSelected}
              title={reason ?? undefined}
              onClick={() => {
                if (disabled) {
                  setBlockedNotice(
                    `${new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                      timeZone: "UTC",
                    }).format(day.date)} - ${reason}`
                  );
                  return;
                }
                setBlockedNotice(null);
                onChange(day.iso);
              }}
              className={cn(
                "flex h-11 items-center justify-center rounded-md text-sm transition-colors",
                !day.inMonth && "opacity-40",
                disabled && "cursor-not-allowed text-ink/30 line-through",
                !disabled && !isSelected && "text-ink hover:bg-cream-200/70",
                isSelected && "bg-rosewood font-medium text-cream-50"
              )}
            >
              {day.dayOfMonth}
            </button>
          );
        })}
      </div>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          "mt-3 min-h-5 text-sm",
          blockedNotice ? "text-rosewood-d" : "text-transparent"
        )}
      >
        {/* A non-breaking space, not empty - reserves the line's height
            (min-h-5) so the calendar doesn't jump when a notice appears.
            Real text here would get announced by aria-live on every
            keystroke even while invisible. */}
        {blockedNotice ?? " "}
      </p>
    </div>
  );
}

export function formatChosenDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(fromISODate(iso));
}
