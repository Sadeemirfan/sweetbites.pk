import { createClient } from "@/lib/supabase/server";
import { addDays, toISODate, today } from "@/lib/availability";
import { REMINDER_LEAD_DAYS, type Reminder } from "@/lib/admin/reminder-format";

/**
 * §13.4 - occasion reminder queries. The highest commercial value
 * feature in the system, and it costs one optional field at order time.
 *
 * The window is fixed at today + 2 days and must stay there: the whole
 * point is that the reminder arrives early enough for the customer to
 * still order inside the 2-day lead time. A same-day reminder is
 * useless.
 *
 * Message formatting lives in reminder-format.ts so client components
 * can use it without pulling `next/headers` into the browser bundle.
 */
export { REMINDER_LEAD_DAYS };
export type { Reminder };

type OrderRow = {
  id: string;
  customer_id: string | null;
  order_number: string | null;
  phone: string;
  whatsapp: string | null;
  customer_name: string | null;
  occasion: string | null;
  occasion_person: string | null;
  occasion_date: string | null;
  occasion_md: string | null;
  total: number | null;
  order_items: { name_snapshot: string | null; size_label: string | null; flavor: string | null }[];
};

/**
 * "2 Pound Chocolate Fudge" - the phrasing §13.4's example uses.
 * Size plus flavour reads naturally in a message; appending the product
 * name too gives "2 Pound Chocolate Fudge Classic Chocolate Birthday
 * Cake", which is both redundant and unusable in a sentence. The name is
 * only used when there is no flavour to name the cake by.
 */
function describeItems(items: OrderRow["order_items"]): string[] {
  return items.map((item) => {
    const descriptor = item.flavor
      ? [item.size_label, item.flavor]
      : [item.size_label, item.name_snapshot];
    return descriptor.filter(Boolean).join(" ");
  });
}

/** MM-DD for a date N days from today, matching the generated occasion_md column. */
function monthDayAhead(days: number, now: Date = new Date()): { md: string; iso: string } {
  const target = addDays(today(now), days);
  const iso = toISODate(target);
  return { md: iso.slice(5), iso };
}

async function loadReminders(
  monthDays: { md: string; iso: string }[],
  now: Date = new Date()
): Promise<Reminder[]> {
  if (!monthDays.length) return [];

  const supabase = await createClient();
  const currentYear = today(now).getUTCFullYear();

  // Uses idx_orders_occasion_md - the generated month-day column from
  // Phase 2 - so this stays an equality lookup rather than a scan.
  const { data } = await supabase
    .from("orders")
    .select(
      `id, customer_id, order_number, phone, whatsapp, customer_name,
       occasion, occasion_person, occasion_date, occasion_md, total,
       order_items ( name_snapshot, size_label, flavor )`
    )
    .in(
      "occasion_md",
      monthDays.map((entry) => entry.md)
    )
    .not("occasion", "is", null)
    .neq("occasion", "none")
    .neq("status", "cancelled");

  const orders = (data ?? []) as unknown as OrderRow[];

  // Only orders from a PREVIOUS year are reminders - an order placed for
  // this year's birthday is a live order, not something to chase.
  const past = orders.filter((order) => {
    if (!order.occasion_date) return false;
    return Number(order.occasion_date.slice(0, 4)) < currentYear;
  });

  if (!past.length) return [];

  // Already actioned this year?
  const { data: logs } = await supabase
    .from("reminder_log")
    .select("id, order_id, reminder_date, status")
    .in(
      "order_id",
      past.map((order) => order.id)
    )
    .gte("reminder_date", `${currentYear}-01-01`);

  const logByOrder = new Map((logs ?? []).map((log) => [log.order_id, log]));
  const isoByMd = new Map(monthDays.map((entry) => [entry.md, entry.iso]));
  const todayIso = toISODate(today(now));

  return past
    .map((order) => {
      const upcomingDate = isoByMd.get(order.occasion_md ?? "") ?? todayIso;
      const log = logByOrder.get(order.id);

      return {
        orderId: order.id,
        customerId: order.customer_id,
        orderNumber: order.order_number,
        person: order.occasion_person,
        occasion: order.occasion ?? "occasion",
        occasionDate: order.occasion_date!,
        upcomingDate,
        daysAway: Math.round(
          (new Date(`${upcomingDate}T12:00:00Z`).getTime() -
            new Date(`${todayIso}T12:00:00Z`).getTime()) /
            86400000
        ),
        customerName: order.customer_name,
        phone: order.phone,
        whatsapp: order.whatsapp,
        lastTotal: order.total,
        lastItems: describeItems(order.order_items ?? []),
        logStatus: log?.status ?? null,
        logId: log?.id ?? null,
      };
    })
    .sort((a, b) => a.upcomingDate.localeCompare(b.upcomingDate));
}

/**
 * The reminders due right now: occasions landing exactly two days from
 * today. Anything already contacted, ordered, or dismissed this year is
 * filtered out so it isn't shown twice (§13.4 step 5).
 */
export async function getDueReminders(now: Date = new Date()): Promise<Reminder[]> {
  const reminders = await loadReminders([monthDayAhead(REMINDER_LEAD_DAYS, now)], now);
  return reminders.filter((reminder) => reminder.logStatus === null);
}

/** Planning views (§13.4) - everything coming up, actioned or not. */
export async function getUpcomingReminders(
  horizonDays: number,
  now: Date = new Date()
): Promise<Reminder[]> {
  const days = Array.from({ length: horizonDays }, (_, index) => monthDayAhead(index, now));
  return loadReminders(days, now);
}
