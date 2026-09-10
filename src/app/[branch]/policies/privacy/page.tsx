import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Prose } from "@/components/ui/Prose";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getBranchInfo, isBranch } from "@/lib/branches";

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
    description: `What information ${branchInfo.name} collects when you order, and how it's used.`,
    alternates: { canonical: `/${branch}/policies/privacy` },
  };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);
  const hasOrderRecords = branch === "arifwala";

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Privacy policy" }]} />

      <SectionHeader eyebrow="Policies" title="Privacy policy" />

      <div className="mt-8">
        <Prose>
          <h2>What we collect</h2>
          <p>
            This website itself doesn&apos;t have an account system or a checkout form - there is
            nothing to sign up for. Every order goes through WhatsApp, so what we know about you
            is whatever you tell us there: your name, phone number, delivery address, and the
            details of what you&apos;re ordering.
          </p>

          {hasOrderRecords ? (
            <p>
              Because {branchInfo.name} takes orders in person and by phone as well as WhatsApp,
              we keep a simple record of past orders - name, phone number, delivery address, and
              order history - so that if you order again, we don&apos;t have to ask you to repeat
              everything. This record is only used by our own kitchen staff to prepare and deliver
              orders.
            </p>
          ) : (
            <p>
              {branchInfo.name} doesn&apos;t keep a separate customer database - your order
              details live in the WhatsApp conversation between you and our business number, the
              same as messaging any other business on WhatsApp.
            </p>
          )}

          <h2>How we use it</h2>
          <p>
            Only to take, confirm, prepare, and deliver your order, and to reach you if there is a
            question about it. We don&apos;t use it for marketing you haven&apos;t asked for.
          </p>

          <h2>What we don&apos;t do</h2>
          <p>
            We don&apos;t sell, rent, or share your information with third parties. WhatsApp
            itself is operated by Meta, and any message you send us is subject to WhatsApp&apos;s
            own privacy terms as well as ours.
          </p>

          <h2>Reviews</h2>
          <p>
            If you leave a review on this site, the name and text you submit are shown publicly
            once approved. Your phone number is never published.
          </p>

          <h2>Questions</h2>
          <p>
            If you have a question about your information or want something about a past order
            removed, message us on WhatsApp at {branchInfo.phoneDisplay} and we&apos;ll sort it
            out directly.
          </p>
        </Prose>
      </div>
    </Section>
  );
}
