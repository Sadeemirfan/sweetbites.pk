import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { Section, SectionHeader } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { DEFAULT_WHATSAPP_MESSAGE, whatsappLink } from "@/lib/utils/whatsapp";

export const metadata: Metadata = {
  title: "Cake Ordering FAQ | Sweet Bites Arifwala",
  description:
    "Lead time, delivery charges, payment methods, and how to store your cake - the questions we're asked most at Sweet Bites Arifwala.",
  alternates: { canonical: "/faq" },
};

const ITEMS: { question: string; answerText: string; answer: React.ReactNode }[] = [
  {
    question: "How far in advance do I need to order?",
    answerText:
      "Every cake needs a minimum of two days. Custom, theme and tiered cakes need three. There is no same-day or next-day option, because nothing is pre-made - your cake is started after you order it. Orders placed after 6:00 PM count from the next morning, since ingredients are bought at the start of the day.",
    answer: (
      <>
        Every cake needs a minimum of <strong>two days</strong>. Custom, theme and tiered cakes
        need <strong>three</strong>. There is no same-day or next-day option, because nothing is
        pre-made - your cake is started after you order it. Orders placed after 6:00 PM count from
        the next morning, since ingredients are bought at the start of the day.
      </>
    ),
  },
  {
    question: "Do you charge for delivery?",
    answerText:
      "Delivery is free anywhere inside Arifwala city, up to 10:00 PM. Nearby villages and outlying areas have a delivery charge that depends on the location. Deliveries after 10:00 PM carry an extra late-night charge, including inside the city. Pickup from the shop is always free.",
    answer: (
      <>
        Delivery is <strong>free anywhere inside Arifwala city</strong>, up to 10:00 PM. Nearby
        villages and outlying areas have a charge that depends on the location - see{" "}
        <Link href="/contact" className="text-rosewood underline underline-offset-4">
          the list on our contact page
        </Link>
        . Deliveries after 10:00 PM carry an extra late-night charge, including inside the city.
        Pickup from the shop is always free.
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
      "Usually, yes. Send the picture on WhatsApp or through the custom cake form with your budget, and we will tell you honestly how close we can get and what it will cost. We would rather say a design is not possible than deliver something that disappoints you.",
    answer: (
      <>
        Usually, yes. Send the picture on WhatsApp or through the{" "}
        <Link href="/custom-cake" className="text-rosewood underline underline-offset-4">
          custom cake form
        </Link>{" "}
        with your budget, and we will tell you honestly how close we can get and what it will cost.
        We would rather say a design is not possible than deliver something that disappoints you.
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
        the cream softens and the sponge is not cold and firm. Because there are no preservatives,
        it is best eaten within two days. Fresh cream and fruit cakes should not sit out in the
        heat.
      </>
    ),
  },
  {
    question: "Can I change or cancel my order?",
    answerText:
      "Message us as soon as you can. Changes are usually fine until we have started shopping and baking for your order. After that, ingredients are already bought and a cancellation cannot be refunded in full.",
    answer: (
      <>
        Message us as soon as you can. Changes are usually fine until we have started shopping and
        baking for your order. After that, ingredients are already bought - see the{" "}
        <Link href="/policies/order" className="text-rosewood underline underline-offset-4">
          order policy
        </Link>{" "}
        for the details.
      </>
    ),
  },
  {
    question: "Do you deliver to other cities?",
    answerText:
      "No. We deliver inside Arifwala and to nearby villages only. A fresh cream cake does not travel well over long distances, and we would rather not send one than send one that arrives damaged.",
    answer: (
      <>
        No. We deliver inside Arifwala and to nearby villages only. A fresh cream cake does not
        travel well over long distances, and we would rather not send one than send one that
        arrives damaged.
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

export default function FaqPage() {
  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answerText },
          })),
        }}
      />

      <Section tone="cream">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "FAQ" }]} />

        <div className="max-w-3xl">
          <SectionHeader
            eyebrow="Questions"
            title="Things people ask before ordering"
            lead="If your question isn't here, message us - we answer during shop hours."
          />

          <div className="mt-10">
            <Faq items={ITEMS} />
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-lg border border-cream-200 bg-cream-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base text-ink">Still not sure about something?</p>
            <ButtonLink
              variant="whatsapp"
              href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
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
