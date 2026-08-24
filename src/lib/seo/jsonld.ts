import { BUSINESS, SITE_URL } from "@/lib/constants";
import type { Product } from "@/types/catalogue";

/** PLAN.md §15 - Bakery with geo, hours, telephone, and all four sameAs. */
export function bakerySchema(aggregate?: { count: number; average: number } | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SITE_URL}/#bakery`,
    name: BUSINESS.name,
    description:
      "Homemade, made-to-order cakes in Arifwala, Punjab. Every cake is baked after you order it.",
    url: SITE_URL,
    telephone: BUSINESS.phoneE164,
    priceRange: "Rs. 1,200 – Rs. 25,000",
    currenciesAccepted: BUSINESS.currency,
    paymentAccepted: "Cash on Delivery, JazzCash, Easypaisa, Bank transfer",
    image: `${SITE_URL}/logo-transparent.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    areaServed: { "@type": "City", name: BUSINESS.city },
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
        opens: BUSINESS.opens,
        closes: BUSINESS.closes,
      },
    ],
    // Every profile the business actually owns - this is what ties the
    // site to its social presence for Google (§15).
    sameAs: [
      BUSINESS.socials.instagram,
      BUSINESS.socials.facebook,
      BUSINESS.socials.tiktok,
      BUSINESS.socials.youtube,
      BUSINESS.socials.threads,
      BUSINESS.socials.pinterest,
    ],
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
  };
}

export function productSchema(product: Product, categorySlug: string) {
  const offers = product.sizes.length
    ? product.sizes.map((size) => ({
        "@type": "Offer",
        name: size.label,
        price: size.price,
        priceCurrency: BUSINESS.currency,
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/gallery/${categorySlug}/${product.slug}`,
      }))
    : [
        {
          "@type": "Offer",
          price: product.base_price ?? 0,
          priceCurrency: BUSINESS.currency,
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/gallery/${categorySlug}/${product.slug}`,
        },
      ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    category: product.category?.name,
    brand: { "@type": "Brand", name: BUSINESS.name },
    ...(product.image_url ? { image: product.image_url } : {}),
    offers,
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
