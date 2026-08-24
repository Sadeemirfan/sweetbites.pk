import { AdminHeader } from "@/components/admin/AdminBits";
import { ExpensesScreen } from "@/app/admin/expenses/ExpensesScreen";
import { createClient } from "@/lib/supabase/server";
import { toISODate, today } from "@/lib/availability";

export const dynamic = "force-dynamic";

/**
 * Recent items for the §13.2 autocomplete. Pulled from the last 400
 * expenses and reduced to the most recent price per item name - "after
 * a few weeks the same twenty items repeat", and typing "fl" should
 * offer Flour at the last price paid.
 */
async function getItemSuggestions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("item, vendor, unit, unit_price, amount, category_id, purchased_on")
    .order("purchased_on", { ascending: false })
    .limit(400);

  const seen = new Map<
    string,
    {
      item: string;
      vendor: string | null;
      unit: string | null;
      unitPrice: number | null;
      amount: number;
      categoryId: string | null;
      lastBought: string;
      timesBought: number;
    }
  >();

  for (const row of data ?? []) {
    const key = row.item.trim().toLowerCase();
    const existing = seen.get(key);
    if (existing) {
      existing.timesBought += 1;
      continue;
    }
    seen.set(key, {
      item: row.item.trim(),
      vendor: row.vendor,
      unit: row.unit,
      unitPrice: row.unit_price === null ? null : Number(row.unit_price),
      amount: Number(row.amount) || 0,
      categoryId: row.category_id,
      lastBought: row.purchased_on,
      timesBought: 1,
    });
  }

  return [...seen.values()].sort((a, b) => b.timesBought - a.timesBought);
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("expenses")
    .select("*, expense_categories ( id, name )")
    .limit(500);

  if (params.from) query = query.gte("purchased_on", params.from);
  if (params.to) query = query.lte("purchased_on", params.to);
  if (params.category) query = query.eq("category_id", params.category);
  if (params.vendor) query = query.ilike("vendor", `%${params.vendor}%`);
  if (params.type === "business" || params.type === "home") {
    query = query.eq("expense_type", params.type);
  }

  const sort = params.sort === "amount" ? "amount" : "purchased_on";
  query = query.order(sort, { ascending: false });

  const [{ data: expenses }, { data: categories }, suggestions] = await Promise.all([
    query,
    supabase.from("expense_categories").select("id, name").eq("is_active", true).order("sort_order"),
    getItemSuggestions(),
  ]);

  return (
    <>
      <AdminHeader title="Expenses" subtitle="Every purchase - Sweet Bites and home" />
      <div className="p-4 md:p-6">
        <ExpensesScreen
          todayIso={toISODate(today())}
          categories={categories ?? []}
          suggestions={suggestions}
          expenses={(expenses ?? []).map((row) => ({
            id: row.id,
            item: row.item,
            vendor: row.vendor,
            quantity: row.quantity === null ? null : Number(row.quantity),
            unit: row.unit,
            amount: Number(row.amount) || 0,
            purchasedOn: row.purchased_on,
            note: row.note,
            receiptUrl: row.receipt_url,
            expenseType: row.expense_type === "home" ? "home" : "business",
            categoryId: row.category_id,
            categoryName:
              (row as unknown as { expense_categories: { name: string } | null })
                .expense_categories?.name ?? null,
          }))}
        />
      </div>
    </>
  );
}
