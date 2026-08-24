import { AdminHeader } from "@/components/admin/AdminBits";
import { ReviewsManager } from "@/app/admin/reviews/ReviewsManager";
import { getAllReviews } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  const waiting = reviews.filter((review) => !review.is_approved).length;

  return (
    <>
      <AdminHeader
        title="Reviews"
        subtitle={
          waiting > 0
            ? `${waiting} waiting for you`
            : "Nothing waiting - approved reviews are live on the site"
        }
      />
      <div className="p-4 md:p-6">
        <ReviewsManager
          reviews={reviews.map((review) => ({
            id: review.id,
            customerName: review.customer_name,
            rating: review.rating,
            body: review.body,
            imageUrl: review.image_url,
            isApproved: review.is_approved,
            createdAt: review.created_at,
          }))}
        />
      </div>
    </>
  );
}
