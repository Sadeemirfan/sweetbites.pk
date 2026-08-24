import { AdminHeader } from "@/components/admin/AdminBits";
import { AvailabilityCalendar } from "@/app/admin/availability/AvailabilityCalendar";
import { getBlackoutDates, getMonthOrderCounts } from "@/lib/admin/queries";
import { today } from "@/lib/availability";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const base = today();
  const [yearStr, monthStr] = (m ?? "").split("-");
  const year = Number(yearStr) || base.getUTCFullYear();
  const month = monthStr ? Number(monthStr) - 1 : base.getUTCMonth();

  const [counts, blackouts] = await Promise.all([
    getMonthOrderCounts(year, month),
    getBlackoutDates(),
  ]);

  return (
    <>
      <AdminHeader
        title="Availability"
        subtitle="Your own workload, and any days you want to close"
      />
      <div className="p-4 md:p-6">
        <AvailabilityCalendar
          year={year}
          month={month}
          counts={Object.fromEntries(counts)}
          blackouts={blackouts.map((entry) => ({
            date: entry.date,
            reason: entry.reason,
          }))}
        />
      </div>
    </>
  );
}
