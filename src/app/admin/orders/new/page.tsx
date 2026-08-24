import { AdminHeader } from "@/components/admin/AdminBits";
import { ManualOrderForm } from "@/app/admin/orders/new/ManualOrderForm";
import { getAdminProducts, getDeliveryAreasAdmin } from "@/lib/admin/queries";
import { getSettings, readLateNightFee } from "@/lib/settings";
import { toISODate, today } from "@/lib/availability";
import type { ProductSize } from "@/types/catalogue";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const [products, areas, settings] = await Promise.all([
    getAdminProducts(),
    getDeliveryAreasAdmin(),
    getSettings(),
  ]);

  return (
    <>
      <AdminHeader title="New order" subtitle="For orders that came in off the website" />

      <ManualOrderForm
        products={products
          .filter((product) => product.is_active)
          .map((product) => ({
            id: product.id,
            name: product.name,
            basePrice: product.base_price,
            leadTimeDays: product.lead_time_days,
            sizes: Array.isArray(product.sizes) ? (product.sizes as ProductSize[]) : [],
            flavors: Array.isArray(product.flavors) ? (product.flavors as string[]) : [],
          }))}
        areas={areas
          .filter((area) => area.is_active)
          .map((area) => ({
            id: area.id,
            name: area.name,
            fee: Number(area.fee) || 0,
            isInsideCity: area.is_inside_city,
          }))}
        lateNightFee={readLateNightFee(settings)}
        todayIso={toISODate(today())}
      />
    </>
  );
}
