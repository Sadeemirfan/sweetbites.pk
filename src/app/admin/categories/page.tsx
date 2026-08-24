import { AdminHeader } from "@/components/admin/AdminBits";
import { CategoriesManager } from "@/app/admin/categories/CategoriesManager";
import { getAdminCategories } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminHeader
        title="Categories"
        subtitle="How the gallery is organised - the order here is the order customers see"
      />
      <div className="p-4 md:p-6">
        <CategoriesManager
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            is_active: category.is_active,
            productCount: category.productCount,
          }))}
        />
      </div>
    </>
  );
}
