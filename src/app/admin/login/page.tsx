import type { Metadata } from "next";
import { LoginForm } from "@/app/admin/login/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login - Sweet Bites",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-cream-100 p-6 shadow-cream">
        <h1 className="font-display text-lg text-ink">Sweet Bites Admin</h1>
        <p className="mt-1 text-sm text-ink/70">Sign in to manage orders, products, and reports.</p>
        <LoginForm />
      </div>
    </div>
  );
}
