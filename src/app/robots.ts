import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // §15 - the dashboard and private backend APIs must never be indexed.
      disallow: ["/admin", "/admin/", "/api", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
