import { AdminHeader, EmptyRow } from "@/components/admin/AdminBits";
import { KitchenDay } from "@/app/admin/kitchen/KitchenDay";
import { getKitchenDay } from "@/lib/admin/queries";
import { toISODate, today } from "@/lib/availability";

export const dynamic = "force-dynamic";

export default async function KitchenPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const dateIso = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? date! : toISODate(today());
  const orders = await getKitchenDay(dateIso);

  return (
    <>
      <AdminHeader
        title="Kitchen"
        subtitle="Everything due on one day, grouped by time slot"
      />

      <div className="p-4 md:p-6">
        {orders.length === 0 ? (
          <>
            <KitchenDay dateIso={dateIso} orders={[]} />
            <div className="mt-4">
              <EmptyRow href="/admin/orders/new" cta="Add an order">
                Nothing due on this date. Pick another day above, or add an order that came in on
                WhatsApp.
              </EmptyRow>
            </div>
          </>
        ) : (
          <KitchenDay dateIso={dateIso} orders={orders} />
        )}
      </div>
    </>
  );
}
