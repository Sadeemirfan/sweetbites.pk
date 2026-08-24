import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { NAV_LINKS } from "@/components/layout/nav-links";

export function Footer() {
  return (
    <footer className="bg-rosewood-d text-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <Logo variant="cream" width={160} />
            <p className="max-w-xs text-sm text-cream-200">
              Homemade, made-to-order cakes in Arifwala. Every cake is baked
              after you order it - nothing is pre-made.
            </p>
            <SocialLinks className="-ml-2.5 flex items-center" />
          </div>

          {/* Footer links are real mobile navigation, so each one holds a
              44px tap target (§2.6) rather than sitting at text height. */}
          <nav className="flex flex-col">
            <span className="eyebrow mb-2 text-cream-200">Explore</span>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-sm text-cream-100 transition-colors hover:text-ghee"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 text-sm text-cream-100">
            <span className="eyebrow text-cream-200">Visit &amp; order</span>
            <a
              href="https://wa.me/923217337801"
              className="inline-flex min-h-11 items-center hover:text-ghee"
            >
              WhatsApp: 0321 7337801
            </a>
            <p className="max-w-xs">
              Near Masjid Riaz-ul-Jannah, Gulshan-e-Wahab Phase 2, Arifwala,
              Punjab
            </p>
            <p>8:00 AM – 10:00 PM, all seven days</p>
          </div>
        </div>

        <div className="mt-10 border-t border-cream-100/15 pt-6 text-xs text-cream-200">
          © {new Date().getFullYear()} Sweet Bites Arifwala. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
