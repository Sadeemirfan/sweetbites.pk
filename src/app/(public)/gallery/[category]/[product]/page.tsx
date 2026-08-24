import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ProductOrderPanel } from "@/components/ui/ProductOrderPanel";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/seo/jsonld";
import { getCategoryBySlug, getProductBySlug } from "@/lib/supabase/queries";
import { earliestDate } from "@/lib/availability";
import { formatLongDate } from "@/lib/utils/format";

type PageProps = { params: Promise<{ category: string; product: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, product: productSlug } = await params;
  const product = await getProductBySlug(categorySlug, productSlug);

  if (!product) return { title: "Cake not found | Sweet Bites" };

  return {
    title: `${product.name} in Arifwala | Sweet Bites`,
    description:
      product.description ??
      `${product.name}, made to order in Arifwala. See sizes, flavours and prices.`,
    alternates: { canonical: `/gallery/${categorySlug}/${product.slug}` },
    openGraph: {
      title: `${product.name} | Sweet Bites Arifwala`,
      description: product.description ?? undefined,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { category: categorySlug, product: productSlug } = await params;
  const [product, category] = await Promise.all([
    getProductBySlug(categorySlug, productSlug),
    getCategoryBySlug(categorySlug),
  ]);

  if (!product || !category) notFound();

  const readyDate = formatLongDate(earliestDate(product.lead_time_days));
  const gallery = product.images.length
    ? product.images
    : product.image_url
      ? [product.image_url]
      : [];

  return (
    <>
      <JsonLd schema={productSchema(product, categorySlug)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Gallery", url: "/gallery" },
          { name: category.name, url: `/gallery/${categorySlug}` },
          { name: product.name, url: `/gallery/${categorySlug}/${product.slug}` },
        ])}
      />

      <Section tone="cream">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Gallery", href: "/gallery" },
            { name: category.name, href: `/gallery/${categorySlug}` },
            { name: product.name },
          ]}
        />

        {/* Two columns from md, not lg: the order panel is the point of
            this page and a full-width image pushes it under the fold. */}
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-cream-200">
              {gallery[0] ? (
                <Image
                  src={gallery[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder className="h-full w-full" label="Photo coming soon" />
              )}
            </div>

            {gallery.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(1, 5).map((src) => (
                  <div
                    key={src}
                    className="relative aspect-square overflow-hidden rounded-md border border-cream-200"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="eyebrow text-rosewood">{category.name}</span>
              <h1 className="text-xl text-ink md:text-2xl">{product.name}</h1>
              {product.description ? (
                <p className="text-base leading-relaxed text-ink/70">{product.description}</p>
              ) : null}
            </div>

            <ProductOrderPanel product={product} categorySlug={categorySlug} />

            {/* §8: lead time framed as a promise, never a disclaimer. */}
            <div className="rounded-lg border border-cream-200 bg-cream-100 p-4">
              <p className="text-base text-ink">
                The earliest we can have this ready is{" "}
                <span className="font-medium">{readyDate}</span>.
              </p>
              <p className="mt-1 text-sm text-ink/70">
                Every cake is baked after you order it - we don&apos;t keep ready-made stock.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
