import Link from "next/link";

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink/60">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {/* min-h-11 keeps the tap target at 44px without enlarging
                the type - the row height is the trail's whole height. */}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center transition-colors hover:text-rosewood"
              >
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="inline-flex min-h-11 items-center text-ink">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
