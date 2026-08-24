"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Info } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RANGE_OPTIONS, type DateRange, type RangeKey } from "@/lib/admin/ranges";
import type { ReportData } from "@/lib/admin/reports";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const field =
  "h-11 w-full rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood";

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function ReportsScreen({
  range,
  report,
  isShort,
  days,
}: {
  range: DateRange;
  report: ReportData;
  isShort: boolean;
  days: number;
}) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(range.from);
  const [customTo, setCustomTo] = useState(range.to);

  function pick(key: RangeKey) {
    if (key === "custom") {
      router.push(`/admin/reports?range=custom&from=${customFrom}&to=${customTo}`);
      return;
    }
    router.push(`/admin/reports?range=${key}`);
  }

  function exportCsv() {
    const rows: string[][] = [
      ["Sweet Bites Arifwala - report"],
      ["Range", `${range.from} to ${range.to}`, `${days} days`],
      [],
      ["Summary"],
      ["Income", String(report.income)],
      ["Expenses", String(report.expenses)],
      ["Net", String(report.net)],
      ["Orders", String(report.orderCount)],
      ["Average order value", report.averageOrderValue.toFixed(0)],
      [],
      ["Income by channel"],
      ...report.incomeBySource.map((row) => [row.label, String(row.value)]),
      [],
      ["Expenses by category"],
      ...report.expensesByCategory.map((row) => [row.label, String(row.value)]),
      [],
      ["Top products by revenue"],
      ["Product", "Quantity", "Revenue"],
      ...report.topProducts.map((row) => [row.name, String(row.qty), String(row.revenue)]),
      [],
      ["Daily"],
      ["Date", "Income", "Expenses"],
      ...report.series.map((row) => [row.date, String(row.income), String(row.expenses)]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell))
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sweetbites-${range.from}-to-${range.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const maxSource = Math.max(1, ...report.incomeBySource.map((row) => row.value));
  const maxCategory = Math.max(1, ...report.expensesByCategory.map((row) => row.value));

  return (
    <div className="flex flex-col gap-5">
      {/* Range picker */}
      <div className="flex flex-wrap gap-1.5">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => pick(option.key)}
            aria-pressed={range.key === option.key}
            className={cn(
              "min-h-11 rounded-md border px-3 text-sm transition-colors",
              range.key === option.key
                ? "border-rosewood bg-rosewood/10 font-medium text-ink"
                : "border-cream-200 bg-cream-50 text-ink/75"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {range.key === "custom" ? (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            type="date"
            aria-label="From"
            value={customFrom}
            onChange={(event) => setCustomFrom(event.target.value)}
            className={field}
          />
          <input
            type="date"
            aria-label="To"
            value={customTo}
            onChange={(event) => setCustomTo(event.target.value)}
            className={field}
          />
          <button
            type="button"
            onClick={() => pick("custom")}
            className="min-h-11 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
          >
            Apply
          </button>
        </div>
      ) : null}

      <p className="text-sm text-ink/60">
        {range.from} to {range.to} · {days} {days === 1 ? "day" : "days"} · income counted on the
        date each order was due
      </p>

      {/*
        §13.3 - income and expenses are the two primary numbers. Net sits
        below them, deliberately smaller, because on a short range it is
        the least trustworthy figure on the page.
      */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-cream-200 bg-cream-50 p-3">
          <p className="text-xs uppercase tracking-wide text-ink/55">Income</p>
          <p className="mt-1 text-2xl font-medium leading-none text-ghee">
            {formatPrice(report.income)}
          </p>
        </div>
        <div className="rounded-md border border-cream-200 bg-cream-50 p-3">
          <p className="text-xs uppercase tracking-wide text-ink/55">Expenses</p>
          <p className="mt-1 text-2xl font-medium leading-none text-ink">
            {formatPrice(report.expenses)}
          </p>
        </div>
      </div>

      <div className="rounded-md border border-cream-200 bg-cream-100 p-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-ink/70">Net (income − expenses)</p>
          <p
            className={cn(
              "text-lg font-medium",
              report.net >= 0 ? "text-ink" : "text-danger"
            )}
          >
            {formatPrice(report.net)}
          </p>
        </div>

        {isShort ? (
          <p className="mt-2 flex items-start gap-2 border-t border-cream-200 pt-2 text-xs leading-relaxed text-ink/70">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-baking" />
            Ingredients are bought in bulk and used over weeks, so this figure swings. A day you
            buy 20kg of flour looks like a loss; the days it becomes cakes look inflated. Net is
            only meaningful over a month or more - read income and expenses above instead.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Orders" value={String(report.orderCount)} />
        <Stat label="Average order" value={formatPrice(report.averageOrderValue)} />
      </div>

      {/* Line chart */}
      <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
        <h2 className="mb-3 text-sm font-medium text-ink">Income vs expenses</h2>
        {report.series.length === 0 ? (
          <p className="text-sm text-ink/60">Nothing in this range.</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.series} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="var(--cream-200)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value: string) =>
                    SHORT_DATE.format(new Date(`${value}T12:00:00Z`))
                  }
                  tick={{ fontSize: 11, fill: "var(--ink)" }}
                  stroke="var(--cream-200)"
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--ink)" }}
                  stroke="var(--cream-200)"
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                  }
                />
                <Tooltip
                  formatter={(value) => formatPrice(Number(value))}
                  labelFormatter={(value) =>
                    typeof value === "string"
                      ? SHORT_DATE.format(new Date(`${value}T12:00:00Z`))
                      : String(value ?? "")
                  }
                  contentStyle={{
                    background: "var(--cream-50)",
                    border: "1px solid var(--cream-200)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="var(--ghee)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="var(--rosewood)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Splits */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Breakdown
          title="Income by channel"
          empty="No orders in this range."
          rows={report.incomeBySource}
          max={maxSource}
          barClass="bg-ghee"
        />
        <Breakdown
          title="Expenses by category"
          empty="No purchases logged in this range."
          rows={report.expensesByCategory}
          max={maxCategory}
          barClass="bg-rosewood"
        />
      </div>

      {/* Top products */}
      <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
        <h2 className="mb-2 text-sm font-medium text-ink">Top products by revenue</h2>
        {report.topProducts.length === 0 ? (
          <p className="text-sm text-ink/60">No items in this range.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-cream-200">
            {report.topProducts.map((product) => (
              <li key={product.name} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 truncate text-sm text-ink">{product.name}</span>
                <span className="shrink-0 text-xs text-ink/50">×{product.qty}</span>
                <span className="shrink-0 text-sm text-ghee">{formatPrice(product.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/*
        §13.3 - the cost_estimate margin, labelled as an estimate in the
        interface itself rather than hidden in a tooltip. It only covers
        items whose product has an estimate filled in, and that coverage
        is stated so the number is never mistaken for accounting.
      */}
      {report.costEstimate ? (
        <section className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-3">
          <h2 className="text-sm font-medium text-ink">Rough margin - estimate only</h2>
          <p className="mt-1 text-xs text-ink/65">
            Based on the optional cost estimate set per product. It covers{" "}
            {report.costEstimate.coveredItems} item
            {report.costEstimate.coveredItems === 1 ? "" : "s"} in this range, ignores everything
            else, and is not accounting.
          </p>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <dt className="text-xs text-ink/55">Revenue covered</dt>
              <dd className="text-ink">{formatPrice(report.costEstimate.coveredRevenue)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/55">Estimated cost</dt>
              <dd className="text-ink">{formatPrice(report.costEstimate.estimatedCost)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink/55">Estimated margin</dt>
              <dd className="text-ink">
                {formatPrice(
                  report.costEstimate.coveredRevenue - report.costEstimate.estimatedCost
                )}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <button
        type="button"
        onClick={exportCsv}
        className="flex min-h-11 items-center justify-center gap-2 self-start rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-cream-200 bg-cream-50 p-3">
      <p className="text-xs uppercase tracking-wide text-ink/55">{label}</p>
      <p className="mt-1 text-lg font-medium leading-none text-ink">{value}</p>
    </div>
  );
}

function Breakdown({
  title,
  rows,
  max,
  barClass,
  empty,
}: {
  title: string;
  rows: { key: string; label: string; value: number }[];
  max: number;
  barClass: string;
  empty: string;
}) {
  return (
    <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
      <h2 className="mb-2 text-sm font-medium text-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink/60">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate text-ink/80">{row.label}</span>
                <span className="shrink-0 text-ink">{formatPrice(row.value)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
                <div
                  className={cn("h-full rounded-full", barClass)}
                  style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
