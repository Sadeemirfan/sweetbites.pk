import { createClient } from "@/lib/supabase/server";
import { eachDay, type DateRange } from "@/lib/admin/ranges";
import { SOURCE_LABELS } from "@/lib/admin/constants";

/**
 * §13.3 - income and expenses over any period.
 *
 * Income is keyed on `required_date`, not `created_at`: the money and
 * the cake move on the day the order is due, which is also the day the
 * ingredients for it were actually consumed. Pairing that against
 * `expenses.purchased_on` is the closest these two tables get to being
 * comparable - and §13.3 is explicit that even then, short ranges are
 * not a real profitability measure.
 */

export type ReportData = {
  income: number;
  expenses: number;
  net: number;
  orderCount: number;
  averageOrderValue: number;
  incomeBySource: { key: string; label: string; value: number }[];
  expensesByCategory: { key: string; label: string; value: number }[];
  series: { date: string; income: number; expenses: number }[];
  topProducts: { name: string; revenue: number; qty: number }[];
  /** Only covers items whose product has cost_estimate filled in. */
  costEstimate: { coveredRevenue: number; estimatedCost: number; coveredItems: number } | null;
};

export async function getReport(range: DateRange): Promise<ReportData> {
  const supabase = await createClient();

  const [ordersResult, expensesResult, itemsResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, source, required_date, status")
      .gte("required_date", range.from)
      .lte("required_date", range.to)
      .neq("status", "cancelled"),

    // Home purchases are logged in the same table for convenience, but
    // they aren't Sweet Bites' money - the P&L only ever counts business
    // spending, so they're excluded at the query rather than just at
    // display, in case a total gets read from here again elsewhere.
    supabase
      .from("expenses")
      .select("amount, purchased_on, category_id, expense_categories ( name )")
      .eq("expense_type", "business")
      .gte("purchased_on", range.from)
      .lte("purchased_on", range.to),

    supabase
      .from("order_items")
      .select(
        "name_snapshot, qty, unit_price, product_id, orders!inner ( required_date, status ), products ( cost_estimate )"
      )
      .gte("orders.required_date", range.from)
      .lte("orders.required_date", range.to)
      .neq("orders.status", "cancelled"),
  ]);

  const orders = ordersResult.data ?? [];
  const expenses = expensesResult.data ?? [];
  const items = (itemsResult.data ?? []) as unknown as {
    name_snapshot: string | null;
    qty: number;
    unit_price: number | null;
    product_id: string | null;
    orders: { required_date: string; status: string } | null;
    products: { cost_estimate: number | null } | null;
  }[];

  const income = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const expenseTotal = expenses.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  // ── Income by channel - §13.3: "which channel actually brings orders"
  const sourceTotals = new Map<string, number>();
  for (const order of orders) {
    sourceTotals.set(order.source, (sourceTotals.get(order.source) ?? 0) + (Number(order.total) || 0));
  }

  // ── Expenses by category
  const categoryTotals = new Map<string, number>();
  for (const row of expenses) {
    const name =
      (row as unknown as { expense_categories: { name: string } | null }).expense_categories
        ?.name ?? "Uncategorised";
    categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + (Number(row.amount) || 0));
  }

  // ── Daily series for the chart
  const incomeByDay = new Map<string, number>();
  for (const order of orders) {
    incomeByDay.set(
      order.required_date,
      (incomeByDay.get(order.required_date) ?? 0) + (Number(order.total) || 0)
    );
  }
  const expensesByDay = new Map<string, number>();
  for (const row of expenses) {
    expensesByDay.set(
      row.purchased_on,
      (expensesByDay.get(row.purchased_on) ?? 0) + (Number(row.amount) || 0)
    );
  }

  const series = eachDay(range).map((date) => ({
    date,
    income: incomeByDay.get(date) ?? 0,
    expenses: expensesByDay.get(date) ?? 0,
  }));

  // ── Top products by revenue
  const productTotals = new Map<string, { revenue: number; qty: number }>();
  for (const item of items) {
    const name = item.name_snapshot?.trim() || "Unnamed item";
    const revenue = (Number(item.unit_price) || 0) * item.qty;
    const current = productTotals.get(name) ?? { revenue: 0, qty: 0 };
    productTotals.set(name, { revenue: current.revenue + revenue, qty: current.qty + item.qty });
  }

  // ── Rough cost estimate, only where cost_estimate exists (§13.3)
  let coveredRevenue = 0;
  let estimatedCost = 0;
  let coveredItems = 0;
  for (const item of items) {
    const cost = item.products?.cost_estimate;
    if (cost == null) continue;
    coveredRevenue += (Number(item.unit_price) || 0) * item.qty;
    estimatedCost += Number(cost) * item.qty;
    coveredItems += item.qty;
  }

  return {
    income,
    expenses: expenseTotal,
    net: income - expenseTotal,
    orderCount: orders.length,
    averageOrderValue: orders.length ? income / orders.length : 0,
    incomeBySource: [...sourceTotals.entries()]
      .map(([key, value]) => ({ key, label: SOURCE_LABELS[key] ?? key, value }))
      .sort((a, b) => b.value - a.value),
    expensesByCategory: [...categoryTotals.entries()]
      .map(([key, value]) => ({ key, label: key, value }))
      .sort((a, b) => b.value - a.value),
    series,
    topProducts: [...productTotals.entries()]
      .map(([name, totals]) => ({ name, ...totals }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    costEstimate: coveredItems > 0 ? { coveredRevenue, estimatedCost, coveredItems } : null,
  };
}
