import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeader } from "@/components/ui/Section";
import { BRANCHES, getBranchInfo, isBranch } from "@/lib/branches";
import { BLOG_POSTS, renderBlogText } from "@/lib/blog";
import { formatLongDate } from "@/lib/utils/format";

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

  const title = `Cake Guides & Stories | ${branchInfo.name}`;
  const description = `Guides on choosing birthday and wedding cakes in ${branchInfo.city}, flavours, and care tips from ${branchInfo.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/${branch}/blog` },
    openGraph: {
      title,
      description,
      url: `/${branch}/blog`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Blog" }]} />

      <SectionHeader
        eyebrow="From the kitchen"
        title="Guides &amp; cake stories"
        lead="Honest advice on sizes, flavours, care tips, and choosing the right cake for your celebration."
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="flex flex-col justify-between rounded-lg border border-cream-200 bg-white/40 p-6 transition-colors hover:border-rosewood hover:bg-white/70"
          >
            <div className="flex flex-col gap-3">
              <span className="eyebrow text-rosewood">{post.tag}</span>
              <h2 className="text-lg text-ink">
                <Link
                  href={`/${branch}/blog/${post.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm leading-relaxed text-ink/70">
                {renderBlogText(post.excerpt, branchInfo.city)}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-cream-200 pt-4 text-xs text-ink/50">
              <time dateTime={post.publishedDate}>{formatLongDate(new Date(post.publishedDate))}</time>
              <span>{post.readTimeMinutes} min read</span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
