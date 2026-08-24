import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Confirmation } from "@/app/(public)/order/confirmed/[orderNumber]/Confirmation";

export const metadata: Metadata = {
  title: "Order confirmed | Sweet Bites Arifwala",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <Section tone="cream">
      <Confirmation orderNumber={decodeURIComponent(orderNumber)} />
    </Section>
  );
}
