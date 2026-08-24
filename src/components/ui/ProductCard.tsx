import Link from "next/link";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { WhatsAppIcon } from "@/components/ui/Button";
import { TiltCard } from "@/components/motion/TiltCard";
import { formatPrice } from "@/lib/utils/format";
import { productWhatsappLink } from "@/lib/utils/whatsapp";
import type { Product } from "@/types/catalogue";

/**
 * Two actions per §6: open the product, or send it straight to WhatsApp.
 * The card body is a stretched link (`after:inset-0`) and the WhatsApp
 * anchor sits above it on the z-axis - that keeps the whole card
 * clickable without nesting one anchor inside another.
 */
export function ProductCard({
  product,
  categorySlug,
}: {
  product: Product;
  categorySlug: string;
}) {
  const href = `/gallery/${categorySlug}/${product.slug}`;
  const firstSize = product.sizes[0];

  const waHref = productWhatsappLink({
    name: product.name,
    categorySlug,
    productSlug: product.slug,
    size: firstSize?.label,
    flavor: product.flavors[0],
    price: product.startingPrice,
  });

  return (
    <TiltCard className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-cream-200 bg-cream-50 shadow-cream transition-colors hover:border-rosewood/40">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              // §14 - image scale 1.04 on hover.
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-lg leading-snug text-ink">
            <Link href={href} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>

          {product.description ? (
            <p className="line-clamp-2 text-sm text-ink/70">{product.description}</p>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            {/* §14 - the price underline draws in --ghee on hover, using
                the --card-hover value TiltCard sets. */}
            <p className="relative inline-block text-base font-medium text-ghee">
              <span>
                {product.sizes.length > 1 ? "From " : ""}
                {formatPrice(product.startingPrice)}
              </span>
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ghee transition-transform duration-300"
                style={{ transform: "scaleX(var(--card-hover, 0))" }}
              />
            </p>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Order ${product.name} on WhatsApp`}
              className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-md bg-whatsapp text-[#04301A] transition-colors hover:bg-whatsapp/90"
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
