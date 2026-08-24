import { AdminHeader } from "@/components/admin/AdminBits";
import { ReportsScreen } from "@/app/admin/reports/ReportsScreen";
import { getReport } from "@/lib/admin/reports";
import { isShortRange, rangeLengthDays, resolveRange, type RangeKey } from "@/lib/admin/ranges";

export const dynamic = "force-dynamic";

const VALID: RangeKey[] = [
  "today",
  "yesterday",
  "last7",
  "thisMonth",
  "lastMonth",
  "thisYear",
  "custom",
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const key: RangeKey = VALID.includes(params.range as RangeKey)
    ? (params.range as RangeKey)
    : "thisMonth";

  const range = resolveRange(key, { from: params.from, to: params.to });
  const report = await getReport(range);

  return (
    <>
      <AdminHeader title="Reports" subtitle="Income and expenses over any period" />
      <div className="p-4 md:p-6">
        <ReportsScreen
          range={range}
          report={report}
          isShort={isShortRange(range)}
          days={rangeLengthDays(range)}
        />
      </div>
    </>
  );
}
