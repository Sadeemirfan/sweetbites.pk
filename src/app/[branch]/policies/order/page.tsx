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
    title: `Order & Cancellation Policy | ${branchInfo.name}`,
    description: `Lead times, advance payments, and cancellation terms for ${branchInfo.name}.`,
    alternates: { canonical: `/${branch}/policies/order` },
  };
}

export default async function OrderPolicyPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Order Policy" }]} />

      <div className="max-w-3xl">
        <SectionHeader eyebrow="Policy" title="Orders &amp; Cancellations" />

        <Prose className="mt-8">
          <h2>Notice Period (Lead Time)</h2>
          <p>
            Standard cakes require a minimum notice of <strong>2 days</strong>. Custom, theme, and
            tiered cakes require at least <strong>3 days</strong> (with 5+ days recommended for
            complex work).
          </p>
          <p>
            We do not maintain pre-made stock. Baking begins only after your order is confirmed,
            ensuring the cake you receive is completely fresh.
          </p>
          <p>
            Orders placed after <strong>6:00 PM</strong> add one additional day to the lead time, as
            ingredients are purchased fresh early each morning.
          </p>

          <h2>Same-Day Orders</h2>
          <p>
            When kitchen capacity permits, we may accept same-day orders provided the requested
            delivery/pickup slot is at least <strong>5 hours</strong> from the time of confirmation.
          </p>

          <h2>Advance Payments</h2>
          <p>
            <strong>First-time customers</strong> are required to pay in full in advance via
            JazzCash, Easypaisa, or bank transfer before baking commences.
          </p>
          <p>
            Returning customers who have previously completed an order may choose Cash on Delivery
            or advance payment.
          </p>

          <h2>Changes and Rescheduling</h2>
          <p>
            You may request changes to flavor, message, or delivery time up until ingredient
            purchasing and baking have begun. Once baking has started, changes to size or flavor
            cannot be accommodated without additional charges.
          </p>

          <h2>Cancellations and Refunds</h2>
          <p>
            If you need to cancel, please notify us immediately on WhatsApp.
          </p>
          <ul>
            <li>
              <strong>Before preparation begins:</strong> Full refund of any advance payment.
            </li>
            <li>
              <strong>After ingredients are purchased or baking has begun:</strong> Cancellations
              cannot be refunded, as perishable ingredients and labor have already been committed.
            </li>
          </ul>

          <h2>Questions</h2>
          <p>
            Have questions before ordering? Check our{" "}
            <Link href={`/${branch}/faq`}>frequently asked questions</Link> or reach out directly
            on WhatsApp.
          </p>
        </Prose>
      </div>
    </Section>
  );
}
