import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Prose } from "@/components/ui/Prose";
import { Section, SectionHeader } from "@/components/ui/Section";
import { BRANCHES, getBranchInfo, isBranch } from "@/lib/branches";

export function generateStaticParams() {
  return BRANCHES.map((branch) => ({ branch }));
}

type Params = { branch: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { branch } = await params;
  if (!isBranch(branch)) return {};
  const branchInfo = getBranchInfo(branch);

  return {
    title: `Delivery Policy | ${branchInfo.name}`,
    description: `Delivery areas, fees, and pickup details for ${branchInfo.name}.`,
    alternates: { canonical: `/${branch}/policies/delivery` },
  };
}

export default async function DeliveryPolicyPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();

  return (
    <Section tone="cream">
      <Breadcrumbs
        items={[
          { name: "Home", href: `/${branch}` },
          { name: "Policies", href: `/${branch}/policies/order` },
          { name: "Delivery" },
        ]}
      />

      <div className="max-w-3xl">
        <SectionHeader eyebrow="Policy" title="Delivery &amp; Pickup" />

        <Prose className="mt-8">
          <h2>Arifwala Delivery</h2>
          <p>
            Delivery is completely free anywhere inside Arifwala city limits for orders delivered
            between 8:00 AM and 10:00 PM.
          </p>
          <p>
            Deliveries requested after 10:00 PM carry an additional late-night delivery charge
            (including inside the city). This fee is set in the order summary before you confirm.
          </p>

          <h2>Outlying Areas &amp; Nearby Villages</h2>
          <p>
            We deliver to villages and areas surrounding Arifwala. Delivery charges vary by
            distance. See our{" "}
            <Link href={`/${branch}/contact`}>contact page</Link> for common area rates, or
            confirm your location with us on WhatsApp.
          </p>

          <h2>Other Cities</h2>
          <p>
            We do not deliver cakes to other cities. Cakes are perishable, delicate items and do
            not survive long-distance transit.
          </p>

          <h2>Free Pickup</h2>
          <p>
            You are always welcome to pick up your order directly from our kitchen in Gulshan-e-Wahab
            Phase 2, Arifwala, during operating hours (8:00 AM – 10:00 PM). Pickup is always free of
            charge.
          </p>

          <h2>Delivery Windows</h2>
          <p>
            We deliver in scheduled time slots (10 AM – 1 PM, 1 PM – 4 PM, 4 PM – 7 PM, 7 PM – 10
            PM, and after 10 PM). While we aim to deliver promptly within your chosen slot, delivery
            times may vary slightly depending on weather and road conditions.
          </p>
        </Prose>
      </div>
    </Section>
  );
}
