import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { BRANCHES } from "@/lib/branches";
import { BLOG_POSTS } from "@/lib/blog";
import { getCategoriesWithCounts, getAllProductPaths } from "@/lib/supabase/queries";
import { getBranchMenuImageUrl } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const perBranch = await Promise.all(
    BRANCHES.map(async (branch) => {
      // Categories, products and menu are database-driven
      const [categories, products, menuImageUrl] = await Promise.all([
        getCategoriesWithCounts(branch),
        getAllProductPaths(branch),
        getBranchMenuImageUrl(branch),
      ]);

      const hasProducts = products.length > 0;
      const hasMenu = Boolean(menuImageUrl);

      const staticRouteDefs: { path: string; priority: number }[] = [
        { path: "", priority: 0.9 },
        ...(hasProducts ? [{ path: "/gallery", priority: 0.9 }] : []),
        ...(hasMenu ? [{ path: "/menu", priority: 0.8 }] : []),
        { path: "/reviews", priority: 0.7 },
        { path: "/about", priority: 0.6 },
        { path: "/contact", priority: 0.7 },
        { path: "/faq", priority: 0.6 },
        { path: "/blog", priority: 0.5 },
        { path: "/policies/order", priority: 0.3 },
        { path: "/policies/delivery", priority: 0.3 },
        { path: "/policies/privacy", priority: 0.2 },
      ];

      const staticRoutes: MetadataRoute.Sitemap = staticRouteDefs.map((route) => ({
        url: `${SITE_URL}/${branch}${route.path}`,
        changeFrequency: "weekly",
        priority: route.priority,
      }));

      const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
        url: `${SITE_URL}/${branch}/blog/${post.slug}`,
        lastModified: new Date(post.publishedDate),
        changeFrequency: "monthly",
        priority: 0.4,
      }));

      // Only categories with at least 1 active product
      const activeCategories = hasProducts
        ? categories.filter((category) => category.productCount > 0)
        : [];

      const categoryRoutes: MetadataRoute.Sitemap = activeCategories.map((category) => ({
        url: `${SITE_URL}/${branch}/gallery/${category.slug}`,
        lastModified: new Date(category.updated_at ?? category.created_at),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

      const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${SITE_URL}/${branch}/gallery/${product.categorySlug}/${product.productSlug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

      return [
        ...staticRoutes,
        ...blogRoutes,
        ...categoryRoutes,
        ...productRoutes,
      ];
    })
  );

  return [...root, ...perBranch.flat()];
}
