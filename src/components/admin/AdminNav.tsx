"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BellRing,
  CalendarDays,
  ChartLine,
  ChefHat,
  ClipboardList,
  Cog,
  Home,
  Image as ImageIcon,
  Inbox,
  MapPin,
  Menu,
  Plus,
  Star,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/admin/ui/sheet";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  /** /admin would otherwise match every child route. */
  exact?: boolean;
};

const PRIMARY: NavItem[] = [
  { href: "/admin", label: "Today", icon: Home, exact: true },
  { href: "/admin/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
];

const SECONDARY: NavItem[] = [
  { href: "/admin/reminders", label: "Reminders", icon: BellRing },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
  { href: "/admin/reports", label: "Reports", icon: ChartLine },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: ImageIcon },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/custom-requests", label: "Custom requests", icon: Inbox },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/availability", label: "Availability", icon: CalendarDays },
  { href: "/admin/delivery-areas", label: "Delivery areas", icon: MapPin },
  { href: "/admin/settings", label: "Settings", icon: Cog },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/** Desktop rail. Hidden on phones, where the bottom bar takes over. */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    /*
      Sticky and self-scrolling: sixteen rows at a 44px touch target is
      taller than a laptop viewport, so without this the last two links
      (Delivery areas, Settings) sit below the fold, and on a long screen
      like Orders the whole rail scrolls away with the content.
    */
    <nav className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r border-cream-200 bg-cream-100 p-3 lg:flex">
      <Link href="/admin" className="mb-3 px-2 py-1">
        <span className="font-display text-lg text-ink">Sweet Bites</span>
        <span className="block text-xs text-ink/55">Dashboard</span>
      </Link>

      <Link
        href="/admin/orders/new"
        className="mb-3 flex min-h-11 items-center justify-center gap-2 rounded-md bg-rosewood px-3 text-sm font-medium text-cream-50 transition-colors hover:bg-rosewood-d"
      >
        <Plus className="h-4 w-4" />
        New order
      </Link>

      {[...PRIMARY, ...SECONDARY].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm transition-colors",
            isActive(pathname, item.href, item.exact)
              ? "bg-cream-200 font-medium text-ink"
              : "text-ink/75 hover:bg-cream-200/60"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Mobile bottom bar. The three screens used constantly get a permanent
 * slot, "New order" gets the centre because §13.1 makes it the most
 * time-critical action in the dashboard, and everything else lives
 * behind More - keeping any screen two taps away at most (§12).
 */
export function AdminBottomBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-cream-200 bg-cream-100 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {PRIMARY.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
            isActive(pathname, item.href, item.exact) ? "text-rosewood" : "text-ink/65"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}

      <Link
        href="/admin/orders/new"
        aria-label="New order"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] text-rosewood"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rosewood text-cream-50">
          <Plus className="h-4 w-4" />
        </span>
        New
      </Link>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetTrigger
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
            SECONDARY.some((item) => isActive(pathname, item.href))
              ? "text-rosewood"
              : "text-ink/65"
          )}
        >
          <Menu className="h-5 w-5" />
          More
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-cream-50">
          <SheetHeader>
            <SheetTitle>Everything else</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 p-4 pt-0">
            {SECONDARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex min-h-14 items-center gap-2.5 rounded-md border border-cream-200 bg-cream-100 px-3 text-sm text-ink"
              >
                <item.icon className="h-4 w-4 shrink-0 text-rosewood" />
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
