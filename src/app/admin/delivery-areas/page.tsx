import { AdminHeader } from "@/components/admin/AdminBits";
import { AreasManager } from "@/app/admin/delivery-areas/AreasManager";
import { getDeliveryAreasAdmin } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function DeliveryAreasPage() {
  const areas = await getDeliveryAreasAdmin();

  return (
    <>
      <AdminHeader
        title="Delivery areas"
        subtitle="Inside the city is free; villages get their own charge"
      />
      <div className="p-4 md:p-6">
        <AreasManager
          areas={areas.map((area) => ({
            id: area.id,
            name: area.name,
            fee: Number(area.fee) || 0,
            isInsideCity: area.is_inside_city,
            isActive: area.is_active,
          }))}
        />
      </div>
    </>
  );
}
