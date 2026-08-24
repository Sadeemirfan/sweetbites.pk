import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { AdminHeader, StatusBadge, SourceBadge } from "@/components/admin/AdminBits";
import { CustomerNotes } from "@/app/admin/customers/[id]/CustomerNotes";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";
import { OCCASION_LABELS } from "@/lib/order/summary";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!customer) notFound();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, source, status, required_date, total, occasion, occasion_person, occasion_date, order_items ( name_snapshot, size_label, flavor, qty )"
    )
    .eq("customer_id", id)
    .order("required_date", { ascending: false });

  const history = orders ?? [];

  // Every occasion on record, newest first, deduplicated by person+type.
  const occasions = new Map<string, { label: string; date: string }>();
  for (const order of history) {
    if (!order.occasion || order.occasion === "none" || !order.occasion_date) continue;
    const key = `${order.occasion}-${order.occasion_person ?? ""}`;
    if (!occasions.has(key)) {
      occasions.set(key, {
        label: `${OCCASION_LABELS[order.occasion] ?? order.occasion}${
          order.occasion_person ? ` - ${order.occasion_person}` : ""
        }`,
        date: order.occasion_date,
      });
    }
  }

  const waDigits = String(customer.whatsapp || customer.phone)
    .replace(/\D/g, "")
    .replace(/^0/, "");

  return (
    <>
      <AdminHeader
        title={customer.name || customer.phone}
        subtitle={`${customer.total_orders} ${customer.total_orders === 1 ? "order" : "orders"} · ${formatPrice(Number(customer.total_spent) || 0)} lifetime`}
        action={
          <a
            href={`https://wa.me/92${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-md bg-whatsapp px-4 text-sm font-medium text-[#04301A]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        }
      />

      <div className="grid gap-5 p-4 md:p-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">
          <section>
            <h2 className="mb-2 text-sm font-medium text-ink">Order history</h2>
            {history.length === 0 ? (
              <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
                No orders on record yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {history.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-start gap-3 rounded-md border border-cream-200 bg-cream-50 p-3 transition-colors hover:border-rosewood/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm text-ink">{order.required_date}</span>
                          <SourceBadge source={order.source} />
                        </div>
                        <p className="mt-1 truncate text-xs text-ink/60">
                          {(order.order_items ?? [])
                            .map((item) =>
                              [item.size_label, item.flavor, item.name_snapshot]
                                .filter(Boolean)
                                .join(" ")
                            )
                            .join(", ") || order.order_number}
                        </p>
                        {order.occasion && order.occasion !== "none" ? (
                          <p className="mt-1 text-xs text-rosewood">
                            {OCCASION_LABELS[order.occasion] ?? order.occasion}
                            {order.occasion_person ? ` - ${order.occasion_person}` : ""}
                          </p>
                        ) : null}
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

        <aside className="flex flex-col gap-4">
          <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
            <h2 className="mb-2 text-sm font-medium text-ink">Details</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Phone" value={customer.phone} />
              {customer.whatsapp ? <Row label="WhatsApp" value={customer.whatsapp} /> : null}
              {customer.address ? <Row label="Address" value={customer.address} /> : null}
              {customer.first_order_date ? (
                <Row label="First order" value={customer.first_order_date} />
              ) : null}
              {customer.last_order_date ? (
                <Row label="Last order" value={customer.last_order_date} />
              ) : null}
            </dl>
          </section>

          <section className="rounded-md border border-cream-200 bg-cream-50 p-3">
            <h2 className="mb-2 text-sm font-medium text-ink">Occasions on record</h2>
            {occasions.size === 0 ? (
              <p className="text-sm text-ink/60">
                None yet. Adding an occasion to an order is what makes next year&apos;s reminder
                work.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {[...occasions.values()].map((occasion) => (
                  <li key={occasion.label} className="flex justify-between gap-3">
                    <span className="text-ink">{occasion.label}</span>
                    <span className="shrink-0 text-ink/55">{occasion.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <CustomerNotes id={customer.id} initialNotes={customer.notes ?? ""} />
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/55">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
