import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCategoriesWithCounts, getAllProductPaths } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/gallery", priority: 0.9 },
    { path: "/custom-cake", priority: 0.8 },
    { path: "/reviews", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
    { path: "/faq", priority: 0.6 },
    { path: "/policies/order", priority: 0.3 },
    { path: "/policies/delivery", priority: 0.3 },
  ].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));

  // Categories and products are database-driven, so the sitemap grows
  // when the admin adds them - no code change, same as the gallery.
  const [categories, products] = await Promise.all([
    getCategoriesWithCounts(),
    getAllProductPaths(),
  ]);

  return [
    ...staticRoutes,
    ...categories.map((category) => ({
      url: `${SITE_URL}/gallery/${category.slug}`,
      lastModified: new Date(category.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/gallery/${product.categorySlug}/${product.productSlug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
