import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getBranchInfo, isBranch } from "@/lib/branches";
import { BLOG_POSTS, renderBlogText } from "@/lib/blog";
import { formatLongDate } from "@/lib/utils/format";

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
    title: `Blog | ${branchInfo.name}`,
    description: `Cake ideas, ordering guides, and tips from ${branchInfo.name}.`,
    alternates: { canonical: `/${branch}/blog` },
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  const posts = [...BLOG_POSTS].sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1));

  return (
    <Section tone="cream">
      <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Blog" }]} />

      <SectionHeader
        eyebrow="Blog"
        title="Cake ideas & ordering guides"
        lead={`A few notes from the ${branchInfo.city} kitchen - ideas, care tips, and how ordering actually works.`}
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${branch}/blog/${post.slug}`}
            className="flex flex-col gap-3 rounded-lg border border-cream-200 bg-cream-50 p-5 transition-colors hover:border-rosewood/40"
          >
            <span className="eyebrow text-rosewood">{post.tag}</span>
            <h2 className="text-lg leading-snug text-ink">{post.title}</h2>
            <p className="line-clamp-3 text-sm text-ink/70">
              {renderBlogText(post.excerpt, branchInfo.city)}
            </p>
            <p className="mt-auto text-xs text-ink/50">
              {formatLongDate(new Date(post.publishedDate))} · {post.readTimeMinutes} min read
            </p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
