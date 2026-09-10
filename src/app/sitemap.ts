import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { BRANCHES } from "@/lib/branches";
import { BLOG_POSTS } from "@/lib/blog";
import { getCategoriesWithCounts, getAllProductPaths } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];

  const perBranch = await Promise.all(
    BRANCHES.map(async (branch) => {
      const staticRoutes = [
        { path: "", priority: 0.9 },
        { path: "/gallery", priority: 0.9 },
        { path: "/reviews", priority: 0.7 },
        { path: "/about", priority: 0.6 },
        { path: "/contact", priority: 0.7 },
        { path: "/faq", priority: 0.6 },
        { path: "/blog", priority: 0.5 },
        { path: "/policies/order", priority: 0.3 },
        { path: "/policies/delivery", priority: 0.3 },
        { path: "/policies/privacy", priority: 0.2 },
      ].map((route) => ({
        url: `${SITE_URL}/${branch}${route.path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route.priority,
      }));

      const blogRoutes = BLOG_POSTS.map((post) => ({
        url: `${SITE_URL}/${branch}/blog/${post.slug}`,
        lastModified: new Date(post.publishedDate),
        changeFrequency: "monthly" as const,
        priority: 0.4,
      }));

      // Categories and products are database-driven, so the sitemap grows
      // when the admin adds them - no code change, same as the gallery.
      const [categories, products] = await Promise.all([
        getCategoriesWithCounts(branch),
        getAllProductPaths(branch),
      ]);

      return [
        ...staticRoutes,
        ...blogRoutes,
        ...categories.map((category) => ({
          url: `${SITE_URL}/${branch}/gallery/${category.slug}`,
          lastModified: new Date(category.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
        ...products.map((product) => ({
          url: `${SITE_URL}/${branch}/gallery/${product.categorySlug}/${product.productSlug}`,
          lastModified: new Date(product.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ];
    })
  );

  return [...root, ...perBranch.flat()];
}
