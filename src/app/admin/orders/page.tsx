import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminBits";
import { OrdersBoard } from "@/app/admin/orders/OrdersBoard";
import { OrderFilters } from "@/app/admin/orders/OrderFilters";
import { getOrders } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const orders = await getOrders({
    status: params.status,
    source: params.source,
    fulfillment: params.fulfillment,
    from: params.from,
    to: params.to,
    q: params.q,
  });

  return (
    <>
      <AdminHeader
        title="Orders"
        subtitle={`${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
        action={
          <Link
            href="/admin/orders/new"
            className="flex min-h-11 items-center gap-2 rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
          >
            <Plus className="h-4 w-4" />
            New order
          </Link>
        }
      />

      <div className="p-4 md:p-6">
        <OrderFilters />
        <div className="mt-4">
          <OrdersBoard orders={orders} />
        </div>
      </div>
    </>
  );
}
