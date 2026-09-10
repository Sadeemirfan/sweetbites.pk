import { SITE_URL } from "@/lib/constants";
import type { BranchInfo } from "@/lib/branches";
import type { Product, ReviewRow } from "@/types/catalogue";

/** PLAN.md §15 - Bakery with geo, hours, telephone, and all four sameAs. */
export function bakerySchema(
  branchInfo: BranchInfo,
  aggregate?: { count: number; average: number } | null,
  reviews?: ReviewRow[]
) {
  const branchUrl = `${SITE_URL}/${branchInfo.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${branchUrl}/#bakery`,
    name: branchInfo.name,
    description: `Homemade, made-to-order cakes in ${branchInfo.city}, ${branchInfo.region}. Every cake is baked after you order it.`,
    url: branchUrl,
    telephone: branchInfo.phoneE164,
    currenciesAccepted: branchInfo.currency,
    paymentAccepted: "Cash on Delivery, JazzCash, Easypaisa, Bank transfer",
    image: `${SITE_URL}/logo-transparent.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: branchInfo.street,
      addressLocality: branchInfo.city,
      addressRegion: branchInfo.region,
      addressCountry: branchInfo.country,
    },
    ...(branchInfo.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: branchInfo.geo.latitude,
            longitude: branchInfo.geo.longitude,
          },
        }
      : {}),
    areaServed: { "@type": "City", name: branchInfo.city },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: branchInfo.opens,
        closes: branchInfo.closes,
      },
    ],
    // Every profile the business actually owns - this is what ties the
    // site to its social presence for Google (§15).
    sameAs: Object.values(branchInfo.socials).filter(Boolean),
    ...(aggregate
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregate.average,
            reviewCount: aggregate.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews?.length
      ? {
          review: reviews
            .filter((review) => typeof review.rating === "number" && review.body)
            .map((review) => ({
              "@type": "Review",
              reviewRating: {
                "@type": "Rating",
                ratingValue: review.rating,
                bestRating: 5,
                worstRating: 1,
              },
              author: { "@type": "Person", name: review.customer_name?.trim() || "Sweet Bites customer" },
              reviewBody: review.body,
              datePublished: review.created_at,
            })),
        }
      : {}),
  };
}

/**
 * No `offers`/price here on purpose - prices are confirmed on WhatsApp,
 * not published, so nothing here should let a fake or stale number surface
 * in Google search results before a customer even reaches the site.
 */
export function productSchema(branchInfo: BranchInfo, product: Product, categorySlug: string) {
  const productUrl = `${SITE_URL}/${branchInfo.slug}/gallery/${categorySlug}/${product.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    category: product.category?.name,
    brand: { "@type": "Brand", name: branchInfo.name },
    ...(product.image_url ? { image: product.image_url } : {}),
    url: productUrl,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
