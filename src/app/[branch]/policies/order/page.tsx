import type { Metadata } from "next";
import Link from "next/link";
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
    title: `Order Policy | ${branchInfo.name}`,
    description: `How ordering works at ${branchInfo.name} - lead times, advance payment on first orders, changes, and cancellations.`,
    alternates: { canonical: `/${branch}/policies/order` },
  };
}

export default async function OrderPolicyPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Order policy" }]} />

      <SectionHeader eyebrow="Policies" title="Order policy" />

      <div className="mt-8">
        <Prose>
          <h2>Lead time</h2>
          <p>
            <strong>Two days</strong> is the standard, since nothing we sell is pre-made. We also
            take <strong>same-day orders</strong>, as long as it&apos;s at least 5 hours before the
            time slot you want - just ask when you message us and we&apos;ll tell you honestly if
            it&apos;s doable. Custom, theme, and tiered cakes need <strong>three days</strong>, and
            elaborate designs are better with five or more.
          </p>
          <p>
            Orders placed after <strong>6:00 PM</strong> are counted from the following morning,
            because ingredients for the next day&apos;s baking are bought at the start of the day.
          </p>

          <h2>Confirming an order</h2>
          <p>
            All orders go through WhatsApp - there&apos;s no order form on the site. An order is
            confirmed once we&apos;ve replied with the price, date, and time slot, not at the
            moment you send your message. If you haven&apos;t heard back from us, please assume the
            order isn&apos;t in the book yet and message us again.
          </p>

          <h2>Payment and first orders</h2>
          <p>We accept Cash on Delivery, JazzCash, Easypaisa, and bank transfer.</p>
          <p>
            If this is your <strong>first order</strong> with us, we ask for the full amount in
            advance. This is not a comment on you - it is that ingredients for a made-to-order cake
            are bought specifically for your order and cannot be resold. Once you have ordered from
            us before, you are free to pay in advance or on delivery.
          </p>

          <h2>Changes</h2>
          <p>
            Changes to flavour, size, message, or design are usually possible until we have started
            shopping and baking for your order - normally the morning before your date. Message us
            as early as you can and we will tell you honestly whether it is still possible.
          </p>

          <h2>Cancellations</h2>
          <ul>
            <li>
              Cancelled <strong>before we start shopping</strong> for your order: any advance is
              refunded in full.
            </li>
            <li>
              Cancelled <strong>after ingredients are bought</strong>: the cost of those
              ingredients is deducted, and the rest is refunded.
            </li>
            <li>
              Cancelled <strong>on the day</strong>, once the cake is baked and decorated: we
              cannot refund the order, because the cake exists and cannot be sold to anyone else.
            </li>
          </ul>

          <h2>If something is wrong</h2>
          <p>
            Tell us the same day, with a photo if you can. If we got something wrong - the wrong
            flavour, a damaged cake, a misspelled name - we will make it right. We would much
            rather hear about it directly than read about it later.
          </p>

          <p>
            Delivery charges, time slots, and late-night fees are covered in the{" "}
            <Link
              href={`/${branch}/policies/delivery`}
              className="text-rosewood underline underline-offset-4"
            >
              delivery policy
            </Link>
            .
          </p>
        </Prose>
      </div>
    </Section>
  );
}
