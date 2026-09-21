import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { BRANCHES, getBranchInfo, isBranch } from "@/lib/branches";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export function generateStaticParams() {
  return BRANCHES.map((branch) => ({ branch }));
}

export default async function BranchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ branch: string }>;
}) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();

  const branchInfo = getBranchInfo(branch);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header branchInfo={branchInfo} />
      {/* pb-20 clears the sticky WhatsApp bar, which shows below lg. */}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer branchInfo={branchInfo} />
      <MobileBottomBar branchInfo={branchInfo} />
      <GoogleAnalytics />
    </div>
  );
}
