import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { Section, SectionHeader } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBranchInfo, isBranch, type BranchInfo } from "@/lib/branches";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";

type Params = { branch: string };

function buildItems(branch: string, branchInfo: BranchInfo) {
  const items: { question: string; answerText: string; answer: React.ReactNode }[] = [
    {
      question: "How far in advance do I need to order?",
      answerText:
        "Two days is the standard, since nothing is pre-made - your cake is started after you order it. We do take same-day orders too, as long as it's at least 5 hours before the time slot you want. Custom, theme and tiered cakes need three days. Orders placed after 6:00 PM count from the next morning, since ingredients are bought at the start of the day.",
      answer: (
        <>
          <strong>Two days</strong> is the standard, since nothing is pre-made - your cake is
          started after you order it. We do take <strong>same-day orders</strong> too, as long as
          it&apos;s at least 5 hours before the time slot you want. Custom, theme and tiered cakes
          need <strong>three days</strong>. Orders placed after 6:00 PM count from the next
          morning, since ingredients are bought at the start of the day.
        </>
      ),
    },
    branchInfo.slug === "arifwala"
      ? {
          question: "Do you charge for delivery?",
          answerText: `Delivery is free anywhere inside ${branchInfo.city} city, up to 10:00 PM. Nearby villages and outlying areas have a delivery charge that depends on the location. Deliveries after 10:00 PM carry an extra late-night charge, including inside the city. Pickup from the shop is always free.`,
          answer: (
            <>
              Delivery is <strong>free anywhere inside {branchInfo.city} city</strong>, up to
              10:00 PM. Nearby villages and outlying areas have a charge that depends on the
              location - see{" "}
              <Link
                href={`/${branch}/contact`}
                className="text-rosewood underline underline-offset-4"
              >
                the list on our contact page
              </Link>
              . Deliveries after 10:00 PM carry an extra late-night charge, including inside the
              city. Pickup from the shop is always free.
            </>
          ),
        }
      : {
          question: "Do you charge for delivery?",
          answerText: `We deliver across ${branchInfo.city}. Message us your address on WhatsApp and we'll confirm whether we can reach you and what the delivery charge is before you order. Pickup from the shop is always free.`,
          answer: (
            <>
              We deliver across {branchInfo.city}. Message us your address on WhatsApp and
              we&apos;ll confirm whether we can reach you and what the delivery charge is before
              you order. Pickup from the shop is always free.
            </>
          ),
        },
    {
      question: "How do I pay?",
      answerText:
        "Cash on Delivery, JazzCash, Easypaisa, or bank transfer. If this is your first order with us, we ask for full payment in advance. Once you have ordered before, you can pay in advance or on delivery, whichever you prefer.",
      answer: (
        <>
          Cash on Delivery, JazzCash, Easypaisa, or bank transfer. If this is your{" "}
          <strong>first order</strong> with us, we ask for full payment in advance. Once you have
          ordered before, you can pay in advance or on delivery, whichever you prefer.
        </>
      ),
    },
    {
      question: "Can you match a cake from a picture?",
      answerText:
        "Usually, yes. Send us the picture on WhatsApp along with your budget, and we will tell you honestly how close we can get and what it will cost. Extra customization - toppers, sugar flowers, hand-painted work, and the like - costs extra, and we always tell you the exact charge before you confirm. We would rather say a design is not possible than deliver something that disappoints you.",
      answer: (
        <>
          Usually, yes. Send us the picture on WhatsApp along with your budget, and we will tell
          you honestly how close we can get and what it will cost. Extra customization - toppers,
          sugar flowers, hand-painted work, and the like - costs extra, and we always tell you the
          exact charge before you confirm. We would rather say a design is not possible than
          deliver something that disappoints you.
        </>
      ),
    },
    {
      question: "How should I store the cake?",
      answerText:
        "Keep it refrigerated and take it out about 20 to 30 minutes before serving, so the cream softens and the sponge is not cold and firm. Because there are no preservatives, it is best eaten within two days. Fresh cream and fruit cakes should not sit out in the heat.",
      answer: (
        <>
          Keep it refrigerated, and take it out <strong>20 to 30 minutes before serving</strong> so
          the cream softens and the sponge is not cold and firm. Because there are no
          preservatives, it is best eaten within two days. Fresh cream and fruit cakes should not
          sit out in the heat.
        </>
      ),
    },
    {
      question: "Can I change or cancel my order?",
      answerText:
        "Message us as soon as you can. Changes are usually fine until we have started shopping and baking for your order. After that, ingredients are already bought and a cancellation cannot be refunded in full.",
      answer: (
        <>
          Message us as soon as you can. Changes are usually fine until we have started shopping
          and baking for your order. After that, ingredients are already bought - see the{" "}
          <Link
            href={`/${branch}/policies/order`}
            className="text-rosewood underline underline-offset-4"
          >
            order policy
          </Link>{" "}
          for the details.
        </>
      ),
    },
    {
      question: "Do you deliver to other cities?",
      answerText: `No. We deliver inside ${branchInfo.city} and to nearby villages only. A fresh cream cake does not travel well over long distances, and we would rather not send one than send one that arrives damaged.`,
      answer: (
        <>
          No. We deliver inside {branchInfo.city} and to nearby villages only. A fresh cream cake
          does not travel well over long distances, and we would rather not send one than send one
          that arrives damaged.
        </>
      ),
    },
    {
      question: "Can you make eggless or sugar-free cakes?",
      answerText:
        "Ask us. Some flavours work eggless, and we can reduce sugar in most recipes. Tell us what you need when you order so we can be honest about whether it will taste the way you expect.",
      answer: (
        <>
          Ask us. Some flavours work eggless, and we can reduce sugar in most recipes. Tell us what
          you need when you order so we can be honest about whether it will taste the way you
          expect.
        </>
      ),
    },
  ];

  return items;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { branch } = await params;
  if (!isBranch(branch)) return {};
  const branchInfo = getBranchInfo(branch);

  return {
    title: `Cake Ordering FAQ | ${branchInfo.name}`,
    description: `Lead time, delivery charges, payment methods, and how to store your cake - the questions we're asked most at ${branchInfo.name}.`,
    alternates: { canonical: `/${branch}/faq` },
  };
}

export default async function FaqPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);
  const items = buildItems(branch, branchInfo);

  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answerText },
          })),
        }}
      />

      <Section tone="cream">
        <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "FAQ" }]} />

        <div className="max-w-3xl">
          <SectionHeader
            eyebrow="Questions"
            title="Things people ask before ordering"
            lead="If your question isn't here, message us - we answer during shop hours."
          />

          <div className="mt-10">
            <Faq items={items} />
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-lg border border-cream-200 bg-cream-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base text-ink">Still not sure about something?</p>
            <ButtonLink
              variant="whatsapp"
              href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
              external
            >
              <WhatsAppIcon />
              Ask on WhatsApp
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
