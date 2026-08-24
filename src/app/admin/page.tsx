import Link from "next/link";
import { AdminHeader, OrderFlags, SourceBadge, StatusBadge } from "@/components/admin/AdminBits";
import { EmptyRow } from "@/components/admin/AdminBits";
import {
  getDashboardKpis,
  getRecentOrders,
  getSevenDayCounts,
} from "@/lib/admin/queries";
import { ReminderCard } from "@/components/admin/ReminderCard";
import { getDueReminders } from "@/lib/admin/reminders";
import { formatPrice } from "@/lib/utils/format";
import { toISODate, today } from "@/lib/availability";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

export default async function AdminDashboardPage() {
  const [kpis, week, recent, reminders] = await Promise.all([
    getDashboardKpis(),
    getSevenDayCounts(),
    getRecentOrders(8),
    getDueReminders(),
  ]);

  const todayIso = toISODate(today());

  return (
    <>
      <AdminHeader
        title="Today"
        subtitle={new Intl.DateTimeFormat("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: "Asia/Karachi",
        }).format(new Date())}
      />

      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/*
          §12 puts the 7-day calendar first - it is "the main element,
          not the KPIs" - so it leads on mobile, where whatever comes
          first is what actually gets looked at.
        */}
        <section>
          <h2 className="mb-2 text-sm font-medium text-ink">Next seven days</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {week.map((day) => {
              const isToday = day.iso === todayIso;
              return (
                <Link
                  key={day.iso}
                  href={`/admin/kitchen?date=${day.iso}`}
                  className={cn(
                    "flex min-h-20 flex-col items-center justify-center gap-0.5 rounded-md border p-1 text-center transition-colors",
                    isToday
                      ? "border-rosewood bg-rosewood/10"
                      : "border-cream-200 bg-cream-100 hover:border-rosewood/40"
                  )}
                >
                  <span className="text-[11px] uppercase tracking-wide text-ink/55">
                    {DAY_FORMAT.format(day.date)}
                  </span>
                  <span className="text-sm text-ink/70">{day.date.getUTCDate()}</span>
                  <span
                    className={cn(
                      "text-lg font-medium leading-none",
                      day.count > 0 ? "text-ink" : "text-ink/25"
                    )}
                  >
                    {day.count}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Order counts only - the system never blocks a day on its own. Tap a day for the
            kitchen sheet.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Orders today" value={String(kpis.todayCount)} />
          <Kpi label="Revenue today" value={formatPrice(kpis.todayRevenue)} accent />
          <Kpi
            label="Pending confirmation"
            value={String(kpis.pendingCount)}
            href="/admin/orders?status=pending"
          />
          <Kpi
            label="Unpaid advances"
            value={String(kpis.unpaidAdvanceCount)}
            danger={kpis.unpaidAdvanceCount > 0}
            href="/admin/orders"
          />
        </section>

        {/* §12/§13.4 - reminders due strip. */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Reminders due</h2>
            <Link href="/admin/reminders" className="text-sm text-rosewood hover:underline">
              All reminders
            </Link>
          </div>

          {reminders.length === 0 ? (
            <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-4 text-sm text-ink/60">
              No occasions falling two days from now. They appear here automatically from past
              orders - check{" "}
              <Link href="/admin/reminders?view=month" className="text-rosewood underline">
                this month
              </Link>{" "}
              to plan ahead.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {reminders.slice(0, 3).map((reminder) => (
                <li key={`${reminder.orderId}-${reminder.upcomingDate}`}>
                  <ReminderCard reminder={reminder} compact />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-rosewood hover:underline">
              All orders
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyRow href="/admin/orders/new" cta="Add an order">
              No orders yet. Orders taken on WhatsApp or in the shop go in here too.
            </EmptyRow>
          ) : (
            <ul className="flex flex-col divide-y divide-cream-200 rounded-md border border-cream-200 bg-cream-50">
              {recent.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 p-3 transition-colors hover:bg-cream-100"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-ink">
                          {order.customer_name || order.phone}
                        </span>
                        <SourceBadge source={order.source} />
                        <OrderFlags
                          isFirstOrder={order.is_first_order}
                          advanceRequired={order.advance_required}
                          paymentStatus={order.payment_status}
                        />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-ink/55">
                        {order.order_number} · due {order.required_date}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm text-ghee">{formatPrice(order.total)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  href,
  accent,
  danger,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
  danger?: boolean;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-1 rounded-md border bg-cream-50 p-3",
        danger ? "border-danger/40" : "border-cream-200"
      )}
    >
      <span className="text-xs text-ink/60">{label}</span>
      <span
        className={cn(
          "text-xl font-medium leading-none",
          accent ? "text-ghee" : danger ? "text-danger" : "text-ink"
        )}
      >
        {value}
      </span>
    </div>
  );

  return href ? (
    <Link href={href} className="transition-colors hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}
