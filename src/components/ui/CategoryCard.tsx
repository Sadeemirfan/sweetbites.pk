import Link from "next/link";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { Branch } from "@/lib/branches";
import type { CategoryWithCount } from "@/types/catalogue";

export function CategoryCard({
  category,
  branch,
}: {
  category: CategoryWithCount;
  branch: Branch;
}) {
  const count = category.productCount;

  return (
    <Link
      href={`/${branch}/gallery/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-cream-200 bg-cream-50 shadow-cream transition-colors hover:border-rosewood/40"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-lg leading-snug text-ink transition-colors group-hover:text-rosewood">
          {category.name}
        </h3>
        {category.description ? (
          <p className="line-clamp-2 text-sm text-ink/70">{category.description}</p>
        ) : null}
        <p className="eyebrow mt-2 text-rosewood">
          {count === 0 ? "Coming soon" : `${count} ${count === 1 ? "cake" : "cakes"}`}
        </p>
      </div>
    </Link>
  );
}
