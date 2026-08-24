import type { Metadata } from "next";
import { Toaster } from "@/components/admin/ui/sonner";
import { AdminBottomBar, AdminSidebar } from "@/components/admin/AdminNav";
import { OrderRealtime } from "@/components/admin/OrderRealtime";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard | Sweet Bites",
  // §15 - /admin/* must never be indexed. robots.ts disallows it too;
  // this is the belt to that braces, and it inherits to every child.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * §12 - a different visual register from the public site: cream, dense,
 * functional, fast. No hero aesthetic, no decorative animation, and no
 * Lenis smooth scroll (that lives in the public layout only).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The login page renders inside this layout too, before there is a
  // session - it supplies its own full-screen shell, so skip the chrome.
  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-dvh bg-cream-50">
      <AdminSidebar />
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
      <AdminBottomBar />
      <OrderRealtime />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
