import Link from "next/link";
import { Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminBits";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingReminders } from "@/lib/admin/reminders";
import { formatPrice } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("id, name, phone, total_orders, total_spent, last_order_date")
    .order("last_order_date", { ascending: false, nullsFirst: false })
    .limit(200);

  if (q?.trim()) {
    query = query.or(`name.ilike.%${q.trim()}%,phone.ilike.%${q.trim()}%`);
  }

  // Next occasion per customer, for the list column (§13.4).
  const [{ data: customers }, upcoming] = await Promise.all([query, getUpcomingReminders(365)]);

  const nextOccasion = new Map<string, { label: string; date: string }>();
  for (const reminder of upcoming) {
    if (!reminder.customerId || nextOccasion.has(reminder.customerId)) continue;
    nextOccasion.set(reminder.customerId, {
      label: reminder.person ? `${reminder.person}'s ${reminder.occasion}` : reminder.occasion,
      date: reminder.upcomingDate,
    });
  }

  return (
    <>
      <AdminHeader
        title="Customers"
        subtitle="Built automatically from every order, whatever channel it came from"
      />

      <div className="p-4 md:p-6">
        <form className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search name or phone"
              inputMode="search"
              className="h-11 w-full rounded-md border border-cream-200 bg-cream-50 pl-9 pr-3 text-base text-ink outline-none focus:border-rosewood"
            />
          </div>
          <button
            type="submit"
            className="min-h-11 rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink"
          >
            Find
          </button>
        </form>

        {!customers?.length ? (
          <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
            No customers yet. They are created automatically the first time you save an order for
            a phone number.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {customers.map((customer) => {
              const occasion = nextOccasion.get(customer.id);
              return (
                <li key={customer.id}>
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="flex items-center gap-3 rounded-md border border-cream-200 bg-cream-50 p-3 transition-colors hover:border-rosewood/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {customer.name || customer.phone}
                      </p>
                      <p className="truncate text-xs text-ink/55">
                        {customer.phone} · {customer.total_orders}{" "}
                        {customer.total_orders === 1 ? "order" : "orders"}
                        {customer.last_order_date ? ` · last ${customer.last_order_date}` : ""}
                      </p>
                      {occasion ? (
                        <p className="mt-1 truncate text-xs text-rosewood">
                          {occasion.label} · {occasion.date}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm text-ghee">
                      {formatPrice(Number(customer.total_spent) || 0)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
