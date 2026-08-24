"use client";

import { cartCount, useCart } from "@/lib/cart/store";

export function CartButton({ className }: { className?: string }) {
  const { items, open, hasHydrated } = useCart();
  const count = cartCount(items);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count > 0 ? `Your order, ${count} items` : "Your order"}
      className={`relative flex h-11 w-11 items-center justify-center rounded-md text-ink transition-colors hover:text-rosewood ${className ?? ""}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4.5 7.5h15l-1.2 11a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8l-1.2-11Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8.75 7.5V6a3.25 3.25 0 0 1 6.5 0v1.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>

      {/* Only after hydration - rendering a count from localStorage
          during SSR would mismatch the server HTML. */}
      {hasHydrated && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ghee px-1 text-xs font-medium text-cream-50">
          {count}
        </span>
      ) : null}
    </button>
  );
}
