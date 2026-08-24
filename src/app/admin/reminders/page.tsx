import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminBits";
import { ReminderCard } from "@/components/admin/ReminderCard";
import {
  getDueReminders,
  getUpcomingReminders,
  REMINDER_LEAD_DAYS,
} from "@/lib/admin/reminders";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const VIEWS = [
  { key: "due", label: "Due now" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
] as const;

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const active = VIEWS.some((option) => option.key === view) ? view! : "due";

  const [due, week, month] = await Promise.all([
    getDueReminders(),
    getUpcomingReminders(7),
    getUpcomingReminders(31),
  ]);

  const shown = active === "due" ? due : active === "week" ? week : month;

  return (
    <>
      <AdminHeader
        title="Reminders"
        subtitle={`Occasions coming up, ${REMINDER_LEAD_DAYS} days ahead so there's still time to bake`}
      />

      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex gap-1.5">
          {VIEWS.map((option) => {
            const count =
              option.key === "due" ? due.length : option.key === "week" ? week.length : month.length;
            return (
              <Link
                key={option.key}
                href={`/admin/reminders?view=${option.key}`}
                className={cn(
                  "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
                  active === option.key
                    ? "border-rosewood bg-rosewood/10 font-medium text-ink"
                    : "border-cream-200 bg-cream-50 text-ink/70"
                )}
              >
                {option.label}
                <span className="text-xs text-ink/45">{count}</span>
              </Link>
            );
          })}
        </div>

        {active === "due" ? (
          <p className="rounded-md border border-cream-200 bg-cream-100 p-3 text-xs leading-relaxed text-ink/70">
            These are occasions falling in exactly {REMINDER_LEAD_DAYS} days. That window is
            deliberate - it is the last moment a customer can still order and have the cake made in
            time. Once you message someone, they drop off this list for the year.
          </p>
        ) : null}

        {shown.length === 0 ? (
          <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
            {active === "due"
              ? "Nothing due today. Occasions appear here two days before the date, so check back tomorrow."
              : "No occasions on record in this period. They build up as you add an occasion to orders."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {shown.map((reminder) => (
              <li key={`${reminder.orderId}-${reminder.upcomingDate}`}>
                <ReminderCard reminder={reminder} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
