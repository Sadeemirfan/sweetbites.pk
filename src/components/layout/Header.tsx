"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppCta } from "@/components/layout/WhatsAppCta";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { CartButton } from "@/components/cart/CartButton";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center" onClick={() => setIsDrawerOpen(false)}>
          {/* The logo is 1167x654, so width sets height at ~0.56x. At
              110px it stands 62px tall and clears the 80px bar with room
              either side; anything wider overflows and clips the cupcake
              mark off the top. */}
          <Logo width={110} priority />
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink transition-colors hover:text-rosewood"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 lg:gap-3">
          <CartButton />
          <WhatsAppCta className="hidden lg:inline-flex" />

          <button
            type="button"
            aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center text-ink lg:hidden"
          >
            <HamburgerIcon isOpen={isDrawerOpen} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-30 bg-cocoa-900/40 transition-opacity lg:hidden",
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-nav-drawer"
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-[80%] max-w-xs flex-col gap-1 bg-cream-50 p-6 shadow-dark transition-transform duration-300 lg:hidden",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsDrawerOpen(false)}
            className="flex min-h-11 items-center border-b border-cream-200 text-base font-medium text-ink"
          >
            {link.label}
          </Link>
        ))}
        <WhatsAppCta className="mt-6 flex w-full" />
      </div>
    </header>
  );
}

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line
        x1="4"
        y1="7"
        x2="20"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className={cn("origin-center transition-transform", isOpen && "translate-y-[5px] rotate-45")}
      />
      <line
        x1="4"
        y1="17"
        x2="20"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className={cn("origin-center transition-transform", isOpen && "-translate-y-[5px] -rotate-45")}
      />
    </svg>
  );
}
