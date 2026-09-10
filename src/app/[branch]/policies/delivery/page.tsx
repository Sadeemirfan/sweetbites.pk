import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Prose } from "@/components/ui/Prose";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getBranchInfo, isBranch } from "@/lib/branches";
import { getDeliveryAreas } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils/format";

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
    description:
      branchInfo.slug === "arifwala"
        ? `Free cake delivery inside ${branchInfo.city} city up to 10:00 PM, charged delivery to nearby villages, time slots, and late-night fees.`
        : `Cake delivery across ${branchInfo.city} - coverage and cost confirmed on WhatsApp before you order. Time slots and late-night fees explained.`,
    alternates: { canonical: `/${branch}/policies/delivery` },
  };
}

export default async function DeliveryPolicyPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  const areas = await getDeliveryAreas(branch);
  const insideCity = areas.filter((area) => area.is_inside_city);
  const outside = areas.filter((area) => !area.is_inside_city);

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Delivery policy" }]} />

      <SectionHeader eyebrow="Policies" title="Delivery policy" />

      <div className="mt-8">
        <Prose>
          <h2>Where we deliver</h2>
          <p>
            We deliver inside {branchInfo.city} city and to nearby villages. We do not deliver to
            other cities - a fresh cream cake does not survive a long journey, and we would rather
            turn an order down than send one that arrives damaged.
          </p>

          {insideCity.length ? (
            <p>
              <strong>Free inside {branchInfo.city} city:</strong>{" "}
              {insideCity.map((area) => area.name).join(", ")}.
            </p>
          ) : null}

          {!areas.length ? (
            <p>
              Message us your address on WhatsApp before you order and we&apos;ll confirm whether
              we can reach you and what delivery costs.
            </p>
          ) : null}

          {outside.length ? (
            <>
              <h2>Nearby areas and charges</h2>
              <ul>
                {outside.map((area) => (
                  <li key={area.id}>
                    {area.name} - <strong>{formatPrice(area.fee)}</strong>
                  </li>
                ))}
              </ul>
              <p>
                If your area is not listed, message us - we will tell you whether we can reach you
                and what it would cost before you order.
              </p>
            </>
          ) : null}

          <h2>Time slots</h2>
          <p>
            You pick a slot when you order: 10 AM–1 PM, 1–4 PM, 4–7 PM, or 7–10 PM. We aim to
            arrive inside your slot and will message you when the cake leaves the kitchen.
          </p>

          <h2>Deliveries after 10:00 PM</h2>
          <p>
            We can deliver after 10:00 PM, but it carries an extra late-night charge, on top of
            whatever the delivery normally costs. That charge is shown to you before you choose
            the slot, never added quietly at the end.
          </p>

          <h2>Pickup</h2>
          <p>
            Pickup from the kitchen is always free. We are at {branchInfo.street}, open{" "}
            {branchInfo.hoursDisplay}.
          </p>

          <h2>When nobody is home</h2>
          <p>
            Please make sure someone can receive the cake in your slot. We will call before we
            arrive. If we cannot hand it over, we will wait as long as we reasonably can, but a
            second delivery attempt to the same address is charged again.
          </p>

          <p>
            Payment terms and cancellations are covered in the{" "}
            <Link
              href={`/${branch}/policies/order`}
              className="text-rosewood underline underline-offset-4"
            >
              order policy
            </Link>
            .
          </p>
        </Prose>
      </div>
    </Section>
  );
}
