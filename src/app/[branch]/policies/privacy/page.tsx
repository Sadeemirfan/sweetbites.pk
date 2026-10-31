import type { Metadata } from "next";
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
    title: `Privacy Policy | ${branchInfo.name}`,
    description: `How ${branchInfo.name} collects, uses, and protects your information.`,
    alternates: { canonical: `/${branch}/policies/privacy` },
  };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  return (
    <Section tone="cream">
      <Breadcrumbs
        items={[
          { name: "Home", href: `/${branch}` },
          { name: "Policies", href: `/${branch}/policies/order` },
          { name: "Privacy" },
        ]}
      />

      <div className="max-w-3xl">
        <SectionHeader eyebrow="Policy" title="Privacy Policy" />

        <Prose className="mt-8">
          <p>
            At Sweet Bites ({branchInfo.name}), we value your privacy. We collect only the
            information strictly needed to bake and deliver your orders.
          </p>

          <h2>Information We Collect</h2>
          <p>
            When you place an order, request a custom quote, or contact us, we collect:
          </p>
          <ul>
            <li>Your name and contact phone number / WhatsApp number.</li>
            <li>Delivery address (if opting for home delivery).</li>
            <li>Cake customization details (names, messages, occasion dates).</li>
            <li>Payment transaction references or receipts for bank/wallet payments.</li>
          </ul>

          <h2>No Customer Accounts</h2>
          <p>
            We do not maintain public customer accounts, passwords, or stored credit card numbers.
            All checkout and communication proceed directly via WhatsApp or phone.
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use your information solely to:</p>
          <ul>
            <li>Fulfill, bake, and deliver your orders.</li>
            <li>Communicate with you regarding your cake details or delivery timing.</li>
            <li>
              Remember your recurring special occasions (such as yearly birthdays or
              anniversaries) so we can send you a reminder in advance.
            </li>
          </ul>

          <h2>Third-Party Sharing</h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties. We share
            address and contact numbers only with our local delivery riders to bring your cake to
            your doorstep.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our privacy practices, please contact us directly on
            WhatsApp at {branchInfo.phoneDisplay}.
          </p>
        </Prose>
      </div>
    </Section>
  );
}
