import { AdminHeader } from "@/components/admin/AdminBits";
import { ProductsManager } from "@/app/admin/products/ProductsManager";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/queries";
import type { ProductSize } from "@/types/catalogue";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);

  return (
    <>
      <AdminHeader title="Products" subtitle="Everything in the gallery, with prices by size" />
      <div className="p-4 md:p-6">
        <ProductsManager
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))}
          products={products.map((product) => ({
            id: product.id,
            categoryId: product.category_id,
            categoryName:
              (product as { categories?: { name?: string } | null }).categories?.name ?? "-",
            name: product.name,
            slug: product.slug,
            description: product.description,
            basePrice: product.base_price,
            costEstimate: product.cost_estimate,
            imageUrl: product.image_url,
            sizes: Array.isArray(product.sizes) ? (product.sizes as ProductSize[]) : [],
            flavors: Array.isArray(product.flavors) ? (product.flavors as string[]) : [],
            leadTimeDays: product.lead_time_days,
            isActive: product.is_active,
            isFeatured: product.is_featured,
          }))}
        />
      </div>
    </>
  );
}
