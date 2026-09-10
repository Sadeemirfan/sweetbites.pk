import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { Prose } from "@/components/ui/Prose";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getBranchInfo, isBranch } from "@/lib/branches";
import { BLOG_POSTS, getBlogPost, renderBlogText } from "@/lib/blog";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";
import { formatLongDate } from "@/lib/utils/format";

type Params = { branch: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { branch, slug } = await params;
  if (!isBranch(branch)) return {};
  const branchInfo = getBranchInfo(branch);
  const post = getBlogPost(slug);
  if (!post) return { title: `Blog | ${branchInfo.name}` };

  return {
    title: `${post.title} | ${branchInfo.name}`,
    description: renderBlogText(post.excerpt, branchInfo.city),
    alternates: { canonical: `/${branch}/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { branch, slug } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <Section tone="cream">
      <Breadcrumbs
        items={[
          { name: "Home", href: `/${branch}` },
          { name: "Blog", href: `/${branch}/blog` },
          { name: post.title },
        ]}
      />

      <div className="max-w-2xl">
        <SectionHeader eyebrow={post.tag} title={post.title} />
        <p className="mt-2 text-sm text-ink/50">
          {formatLongDate(new Date(post.publishedDate))} · {post.readTimeMinutes} min read
        </p>

        <div className="mt-8">
          <Prose>
            {post.body.map((block, index) => {
              if (block.type === "h2") {
                return <h2 key={index}>{renderBlogText(block.text, branchInfo.city)}</h2>;
              }
              if (block.type === "ul") {
                return (
                  <ul key={index}>
                    {block.items.map((item) => (
                      <li key={item}>{renderBlogText(item, branchInfo.city)}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index}>{renderBlogText(block.text, branchInfo.city)}</p>;
            })}
          </Prose>
        </div>

        <div className="mt-10">
          <ButtonLink
            variant="whatsapp"
            href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
            external
          >
            <WhatsAppIcon />
            Ask us on WhatsApp
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}
