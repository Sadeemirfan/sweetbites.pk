"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toggleBlackout } from "@/app/admin/actions";
import { addDays, toISODate, today } from "@/lib/availability";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * §12/§8 rule 4 - the calendar shows each day's order count "so the
 * baker can judge their own load", and blocking a day is a manual act
 * with a reason attached. There is no threshold anywhere in this
 * component: a day with 50 orders is styled exactly like a day with 2,
 * because the system never decides that a day is full.
 */
export function AvailabilityCalendar({
  year,
  month,
  counts,
  blackouts,
}: {
  year: number;
  month: number;
  counts: Record<string, number>;
  blackouts: { date: string; reason: string | null }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const todayIso = toISODate(today());
  const blocked = new Map(blackouts.map((entry) => [entry.date, entry.reason]));

  const firstOfMonth = new Date(Date.UTC(year, month, 1, 12));
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getUTCDay());
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));

  function step(delta: number) {
    const next = new Date(Date.UTC(year, month + delta, 1));
    router.push(
      `/admin/availability?m=${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`
    );
  }

  function submit(dateIso: string) {
    startTransition(async () => {
      const wasBlocked = blocked.has(dateIso);
      const result = await toggleBlackout(dateIso, wasBlocked ? null : reason);
      if (result.ok) {
        toast.success(wasBlocked ? "Day reopened" : "Day blocked");
        setSelected(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-90")}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous month"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 bg-cream-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-base font-medium text-ink">
          {MONTH.format(new Date(Date.UTC(year, month, 1)))}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next month"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-cream-200 bg-cream-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, index) => (
          <div key={index} className="py-1 text-center text-xs text-ink/45">
            {day}
          </div>
        ))}

        {days.map((date) => {
          const iso = toISODate(date);
          const inMonth = date.getUTCMonth() === month;
          const count = counts[iso] ?? 0;
          const isBlocked = blocked.has(iso);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => {
                setSelected(iso);
                setReason(blocked.get(iso) ?? "");
              }}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-md border p-1 transition-colors",
                !inMonth && "opacity-35",
                isBlocked
                  ? "border-danger/50 bg-danger/10"
                  : iso === todayIso
                    ? "border-rosewood bg-rosewood/10"
                    : "border-cream-200 bg-cream-50 hover:border-rosewood/40",
                selected === iso && "ring-2 ring-ghee"
              )}
            >
              <span className="text-xs text-ink/60">{date.getUTCDate()}</span>
              {isBlocked ? (
                <span className="text-[10px] font-medium uppercase text-danger">Closed</span>
              ) : (
                <span
                  className={cn(
                    "text-base font-medium leading-none",
                    count > 0 ? "text-ink" : "text-ink/20"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-ink/50">
        The number is how many orders are already due that day. Nothing is ever blocked
        automatically - a busy day stays open until you close it here.
      </p>

      {selected ? (
        <div className="rounded-md border border-cream-200 bg-cream-100 p-3">
          <p className="text-sm font-medium text-ink">{selected}</p>
          <p className="mt-0.5 text-xs text-ink/60">
            {counts[selected] ?? 0} orders due · {blocked.has(selected) ? "closed" : "open"}
          </p>

          {!blocked.has(selected) ? (
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason customers will see, e.g. Eid holiday"
              className="mt-2 h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood"
            />
          ) : null}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => submit(selected)}
              disabled={pending}
              className={cn(
                "min-h-11 flex-1 rounded-md px-4 text-sm font-medium disabled:opacity-50",
                blocked.has(selected)
                  ? "border border-cream-200 bg-cream-50 text-ink"
                  : "bg-danger text-cream-50"
              )}
            >
              {blocked.has(selected) ? "Reopen this day" : "Close this day"}
            </button>
            <Link
              href={`/admin/kitchen?date=${selected}`}
              className="flex min-h-11 items-center rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink"
            >
              Kitchen
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
