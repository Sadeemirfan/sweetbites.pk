import { createClient } from "@/lib/supabase/server";
import { addDays, toISODate, today } from "@/lib/availability";

/**
 * Admin reads run through the cookie-backed client, not the service
 * role: the signed-in admin satisfies is_admin() so RLS is genuinely
 * exercised rather than bypassed. A bug in a policy should surface here,
 * not be papered over.
 */

export type AdminOrderRow = {
  id: string;
  order_number: string | null;
  source: string;
  customer_name: string | null;
  phone: string;
  required_date: string;
  time_slot: string | null;
  fulfillment: string | null;
  total: number | null;
  status: string;
  payment_status: string;
  is_first_order: boolean;
  advance_required: boolean;
  advance_paid: number;
  created_at: string;
};

const ORDER_LIST_SELECT =
  "id, order_number, source, customer_name, phone, required_date, time_slot, fulfillment, total, status, payment_status, is_first_order, advance_required, advance_paid, created_at";

/** KPI strip on /admin - today's numbers plus the two things that need chasing. */
export async function getDashboardKpis() {
  const supabase = await createClient();
  const todayIso = toISODate(today());

  const [todaysOrders, pending, unpaidAdvances] = await Promise.all([
    supabase
      .from("orders")
      .select("total, status")
      .eq("required_date", todayIso)
      .neq("status", "cancelled"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("advance_required", true)
      .neq("payment_status", "paid")
      .neq("status", "cancelled"),
  ]);

  const rows = todaysOrders.data ?? [];

  return {
    todayCount: rows.length,
    todayRevenue: rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0),
    pendingCount: pending.count ?? 0,
    unpaidAdvanceCount: unpaidAdvances.count ?? 0,
  };
}

/**
 * The 7-day strip - §12 calls this the main element of the dashboard,
 * ahead of the KPIs. It is a workload view, never a capacity gate: the
 * counts exist so the baker can judge their own load (§8 rule 4).
 */
export async function getSevenDayCounts() {
  const supabase = await createClient();
  const start = today();
  const end = addDays(start, 6);

  const { data } = await supabase
    .from("orders")
    .select("required_date, status")
    .gte("required_date", toISODate(start))
    .lte("required_date", toISODate(end))
    .neq("status", "cancelled");

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.required_date, (counts.get(row.required_date) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const iso = toISODate(date);
    return { date, iso, count: counts.get(iso) ?? 0 };
  });
}

export async function getRecentOrders(limit = 8): Promise<AdminOrderRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(ORDER_LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as AdminOrderRow[];
}

export type OrderFilters = {
  status?: string;
  source?: string;
  fulfillment?: string;
  from?: string;
  to?: string;
  q?: string;
};

export async function getOrders(filters: OrderFilters = {}): Promise<AdminOrderRow[]> {
  const supabase = await createClient();
  let query = supabase.from("orders").select(ORDER_LIST_SELECT);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.fulfillment) query = query.eq("fulfillment", filters.fulfillment);
  if (filters.from) query = query.gte("required_date", filters.from);
  if (filters.to) query = query.lte("required_date", filters.to);

  if (filters.q?.trim()) {
    const term = filters.q.trim();
    // Phone or order number - the two things the baker has to hand when
    // a customer messages asking about their cake.
    query = query.or(`phone.ilike.%${term}%,order_number.ilike.%${term}%`);
  }

  const { data } = await query.order("required_date", { ascending: true }).limit(300);
  return (data ?? []) as AdminOrderRow[];
}

/** Everything due on one date - the kitchen screen and its printed sheet. */
export async function getKitchenDay(dateIso: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(
      `id, order_number, source, customer_name, phone, whatsapp, required_date, time_slot,
       fulfillment, address, status, total, payment_status, admin_note, customer_note,
       occasion, occasion_person,
       delivery_areas ( name ),
       order_items ( id, name_snapshot, size_label, flavor, qty, cake_message, weight_kg )`
    )
    .eq("required_date", dateIso)
    .neq("status", "cancelled")
    .order("time_slot", { ascending: true });

  return data ?? [];
}

export async function getOrderDetail(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(
      `*,
       delivery_areas ( name, fee ),
       order_items ( * ),
       order_events ( id, status, note, created_at )`
    )
    .eq("id", id)
    .maybeSingle();

  return data;
}

/** Drives the §13.1 history line: "4 previous orders, last on 12 June." */
export async function lookupCustomerByPhone(phone: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("id, phone, name, whatsapp, address, area_id, total_orders, last_order_date")
    .eq("phone", phone)
    .maybeSingle();

  return data;
}

// Lahore and Pattoki share these tables but have no admin dashboard -
// this one only ever manages Arifwala's rows.
const ADMIN_BRANCH = "arifwala";

export async function getAdminCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*, products(count)")
    .eq("branch", ADMIN_BRANCH)
    // sort_order defaults to 0, so an unarranged list is all ties - and
    // Postgres is free to return ties in any order, which it changes as
    // soon as a row is updated. Without a tiebreaker the list visibly
    // reshuffles every time something is edited.
    .order("sort_order")
    .order("name");

  return (data ?? []).map((row) => {
    const { products, ...category } = row as typeof row & { products: { count: number }[] | null };
    return { ...category, productCount: products?.[0]?.count ?? 0 };
  });
}

export async function getAdminProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories ( id, name, slug )")
    .eq("branch", ADMIN_BRANCH)
    .order("sort_order")
    .order("name");

  return data ?? [];
}

export async function getCustomRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("custom_cake_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllReviews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("branch", ADMIN_BRANCH)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getDeliveryAreasAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("delivery_areas")
    .select("*")
    .eq("branch", ADMIN_BRANCH)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function getBlackoutDates() {
  const supabase = await createClient();
  const { data } = await supabase.from("blackout_dates").select("*").order("date");
  return data ?? [];
}

/** Order counts per day for the availability month view. */
export async function getMonthOrderCounts(year: number, month: number) {
  const supabase = await createClient();
  const start = toISODate(new Date(Date.UTC(year, month, 1, 12)));
  const end = toISODate(new Date(Date.UTC(year, month + 1, 0, 12)));

  const { data } = await supabase
    .from("orders")
    .select("required_date")
    .gte("required_date", start)
    .lte("required_date", end)
    .neq("status", "cancelled");

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.required_date, (counts.get(row.required_date) ?? 0) + 1);
  }
  return counts;
}

export async function getAllSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").order("key");
  return data ?? [];
}
