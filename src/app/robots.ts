import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // §15 - the dashboard must never be indexed. The admin pages also
      // carry robots: noindex in their own metadata, so this holds even
      // if a URL is linked from somewhere else.
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
