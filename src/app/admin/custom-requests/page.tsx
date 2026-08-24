import { AdminHeader } from "@/components/admin/AdminBits";
import { RequestsInbox } from "@/app/admin/custom-requests/RequestsInbox";
import { getCustomRequests } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function CustomRequestsPage() {
  const requests = await getCustomRequests();
  const fresh = requests.filter((request) => request.status === "new").length;

  return (
    <>
      <AdminHeader
        title="Custom requests"
        subtitle={fresh > 0 ? `${fresh} new to quote` : "Nothing new to quote"}
      />
      <div className="p-4 md:p-6">
        <RequestsInbox
          requests={requests.map((request) => ({
            id: request.id,
            name: request.name,
            phone: request.phone,
            occasion: request.occasion,
            tiers: request.tiers,
            weightKg: request.weight_kg,
            flavor: request.flavor,
            theme: request.theme_description,
            referenceImages: Array.isArray(request.reference_images)
              ? (request.reference_images as string[])
              : [],
            budgetMin: request.budget_min,
            budgetMax: request.budget_max,
            requiredDate: request.required_date,
            status: request.status,
            quotedPrice: request.quoted_price,
            adminReply: request.admin_reply,
            createdAt: request.created_at,
          }))}
        />
      </div>
    </>
  );
}
