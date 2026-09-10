import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { navLinks } from "@/components/layout/nav-links";
import { BRANCHES, BRANCH_INFO, type BranchInfo } from "@/lib/branches";

export function Footer({ branchInfo }: { branchInfo: BranchInfo }) {
  const links = navLinks(branchInfo.slug);

  return (
    <footer className="bg-rosewood-d text-cream-100">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:flex-wrap md:justify-between">
          <div className="flex flex-col gap-4">
            <Logo variant="cream" width={160} alt={branchInfo.name} />
            <p className="max-w-xs text-sm text-cream-200">
              Homemade, made-to-order cakes in {branchInfo.city}. Every cake is baked after you
              order it - nothing is pre-made.
            </p>
            <SocialLinks socials={branchInfo.socials} className="-ml-2.5 flex items-center" />
          </div>

          {/* Footer links are real mobile navigation, so each one holds a
              44px tap target (§2.6) rather than sitting at text height. */}
          <nav className="flex flex-col">
            <span className="eyebrow mb-2 text-cream-200">Explore</span>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-sm text-cream-100 transition-colors hover:text-ghee"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav className="flex flex-col">
            <span className="eyebrow mb-2 text-cream-200">Our branches</span>
            {BRANCHES.map((branch) => (
              <Link
                key={branch}
                href={`/${branch}`}
                className="inline-flex min-h-11 items-center text-sm text-cream-100 transition-colors hover:text-ghee"
              >
                {BRANCH_INFO[branch].name}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 text-sm text-cream-100">
            <span className="eyebrow text-cream-200">Visit &amp; order</span>
            <a
              href={`https://wa.me/${branchInfo.whatsappNumber}`}
              className="inline-flex min-h-11 items-center hover:text-ghee"
            >
              WhatsApp: {branchInfo.phoneDisplay}
            </a>
            <p className="max-w-xs">
              {branchInfo.street}, {branchInfo.city}, {branchInfo.region}
            </p>
            <p>{branchInfo.hoursDisplay}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-cream-100/15 pt-6 text-xs text-cream-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {branchInfo.name}. All rights reserved.
          </p>
          <Link href={`/${branchInfo.slug}/policies/privacy`} className="hover:text-ghee">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
