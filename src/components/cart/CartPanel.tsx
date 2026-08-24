"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart/store";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function CartPanel() {
  const { items, isOpen, close, removeItem, setQty, hasHydrated } = useCart();
  const subtotal = cartSubtotal(items);
  const count = cartCount(items);

  // Escape closes, and the page behind must not scroll while the
  // slide-over is up.
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-cocoa-900/40 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        aria-label="Your order"
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream-50 shadow-dark transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
          <h2 className="text-lg text-ink">
            Your order{hasHydrated && count > 0 ? ` (${count})` : ""}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close your order"
            className="flex h-11 w-11 items-center justify-center rounded-md text-ink transition-colors hover:bg-cream-200/70"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!hasHydrated ? null : items.length === 0 ? (
            <div className="flex flex-col items-start gap-4 py-8">
              <p className="text-base text-ink/70">
                Nothing here yet. Pick a cake from the gallery and it will show up in this panel.
              </p>
              <Link
                href="/gallery"
                onClick={close}
                className="inline-flex min-h-11 items-center rounded-md border border-cream-200 px-4 text-sm font-medium text-ink transition-colors hover:border-rosewood hover:text-rosewood"
              >
                Browse the gallery
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((line) => (
                <li key={line.id} className="flex gap-3 border-b border-cream-200 pb-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                    {line.imageUrl ? (
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlaceholder className="h-full w-full" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link
                      href={`/gallery/${line.categorySlug}/${line.productSlug}`}
                      onClick={close}
                      className="text-sm font-medium text-ink hover:text-rosewood"
                    >
                      {line.name}
                    </Link>
                    <p className="text-xs text-ink/60">
                      {[line.sizeLabel, line.flavor].filter(Boolean).join(" · ")}
                    </p>
                    {line.cakeMessage ? (
                      <p className="truncate text-xs text-ink/60">“{line.cakeMessage}”</p>
                    ) : null}

                    <div className="mt-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setQty(line.id, line.qty - 1)}
                        aria-label={`Decrease quantity of ${line.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-cream-200 text-ink"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm text-ink">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.id, line.qty + 1)}
                        aria-label={`Increase quantity of ${line.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-cream-200 text-ink"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(line.id)}
                        className="ml-auto flex h-9 items-center rounded-md px-2 text-xs text-ink/60 transition-colors hover:text-rosewood-d"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-medium text-ghee">
                    {formatPrice(line.unitPrice * line.qty)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasHydrated && items.length > 0 ? (
          <footer className="border-t border-cream-200 px-4 py-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-base text-ink">Subtotal</span>
              <span className="text-lg font-medium text-ghee">{formatPrice(subtotal)}</span>
            </div>
            <p className="mb-3 text-xs text-ink/60">
              Delivery and any late-night charge are added at the next step.
            </p>
            <Link
              href="/order"
              onClick={close}
              className="flex min-h-12 w-full items-center justify-center rounded-md bg-ghee px-5 text-base font-medium text-cream-50 transition-colors hover:bg-ghee/90"
            >
              Continue to checkout
            </Link>
          </footer>
        ) : null}
      </aside>
    </>
  );
}
