import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminBits";
import { OrderDetail } from "@/app/admin/orders/[id]/OrderDetail";
import { getOrderDetail } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) notFound();

  return (
    <>
      <div className="no-print">
        <AdminHeader
          title={order.order_number ?? "Order"}
          subtitle={`Due ${order.required_date}`}
          action={
            <Link
              href="/admin/orders"
              className="flex min-h-11 items-center rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink"
            >
              Back to board
            </Link>
          }
        />
      </div>

      <OrderDetail order={order} />
    </>
  );
}
