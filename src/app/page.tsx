import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Faq } from "@/components/ui/Faq";
import { BRANCHES, BRANCH_INFO } from "@/lib/branches";
import { getApprovedReviews } from "@/lib/supabase/queries";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Sweet Bites - Choose Your City",
  description: "Sweet Bites has homemade cake studios in Arifwala, Lahore, and Pattoki. Choose your city to see the menu and order on WhatsApp.",
  alternates: { canonical: "/" },
};

const WHY_POINTS = [
  {
    title: "Made to order",
    body: "Nothing is pre-made in any of our kitchens. Your cake starts after you place the order, which is why it tastes fresh rather than stocked.",
  },
  {
    title: "No preservatives",
    body: "Real cream, real butter, nothing added to extend shelf life. Best eaten within two days of delivery.",
  },
  {
    title: "Delivery to your door",
    body: "Each kitchen delivers within its own city - message us your address on WhatsApp and we'll confirm coverage and cost.",
  },
  {
    title: "Open seven days",
    body: "8:00 AM to 10:00 PM, every day of the week, including Sundays and public holidays.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Why isn't there a price list on the site?",
    answer: (
      <>
        Every cake is made to order, and extra customization changes the price - so instead of a
        fixed list, we confirm the exact price with you on WhatsApp before you order.
      </>
    ),
  },
  {
    question: "How do I pay?",
    answer: (
      <>
        Cash on Delivery, JazzCash, Easypaisa, or bank transfer. If it&apos;s your first order
        with us, we ask for full payment in advance.
      </>
    ),
  },
  {
    question: "Can you match a cake from a picture?",
    answer: (
      <>
        Usually, yes. Send us the picture on WhatsApp along with your budget. Extra customization
        - toppers, sugar flowers, hand-painted work - costs more, and we always tell you the exact
        charge before you confirm.
      </>
    ),
  },
  {
    question: "How should I store the cake?",
    answer: (
      <>
        Keep it refrigerated and take it out 20-30 minutes before serving, so the cream softens
        and the sponge isn&apos;t cold and firm. Because there are no preservatives, it&apos;s
        best eaten within two days.
      </>
    ),
  },
];

export default async function CitySelectorPage() {
  const branchReviews = await Promise.all(
    BRANCHES.map(async (branch) => {
      const [review] = await getApprovedReviews(branch, 1);
      return review ? { branch, review } : null;
    })
  );
  const reviews = branchReviews.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <main className="flex flex-col bg-cream-50">
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 py-16">
        <Logo width={200} priority className="mb-10" />

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="eyebrow text-rosewood">Sweet Bites</span>
          <h1 className="text-2xl text-ink md:text-3xl">Which city are you in?</h1>
          <p className="max-w-sm text-base text-ink/70">
            Pick your branch to see its menu, prices, and order on WhatsApp.
          </p>
        </div>

        <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {BRANCHES.map((branch) => {
            const info = BRANCH_INFO[branch];
            return (
              <Link
                key={branch}
                href={`/${branch}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 bg-white/40 px-6 py-8 text-center transition-colors hover:border-rosewood hover:bg-white/70"
              >
                <span className="text-lg text-ink">{info.city}</span>
                <span className="text-sm text-ink/60">{info.tagline}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <Section tone="cream-alt">
        <SectionHeader
          eyebrow="Why Sweet Bites"
          title="A home kitchen, not a bakery counter"
          lead="Every branch is a small kitchen, not a factory line. Everything below is a consequence of that, not a marketing line."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {WHY_POINTS.map((point) => (
            <div key={point.title} className="flex flex-col gap-2 border-t border-cream-200 pt-5">
              <h3 className="text-lg text-ink">{point.title}</h3>
              <p className="text-base text-ink/70">{point.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {reviews.length ? (
        <Section tone="cream">
          <SectionHeader
            eyebrow="Reviews"
            title="What customers say"
            lead="One review from each of our kitchens - every one from a real order."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {reviews.map(({ branch, review }) => (
              <div key={branch} className="flex flex-col gap-3">
                <ReviewCard review={review} />
                <Link
                  href={`/${branch}/reviews`}
                  className="text-sm text-rosewood underline-offset-4 hover:underline"
                >
                  More from {BRANCH_INFO[branch].city} →
                </Link>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="cream-alt">
        <SectionHeader eyebrow="Questions" title="Before you message us" />
        <div className="mt-10 max-w-3xl">
          <Faq items={FAQ_ITEMS} />
        </div>
      </Section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 border-t border-cream-200 px-4 py-8 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p>© {new Date().getFullYear()} Sweet Bites. All rights reserved.</p>
        <Link href="/arifwala/policies/privacy" className="hover:text-rosewood">
          Privacy Policy
        </Link>
      </div>
      <GoogleAnalytics />
    </main>
  );
}

export const dynamic = "force-static";
