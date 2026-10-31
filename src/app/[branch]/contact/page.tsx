import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { MapEmbed } from "@/components/sections/LocationHours";
import { JsonLd } from "@/components/seo/JsonLd";
import { bakerySchema } from "@/lib/seo/jsonld";
import { BRANCHES, getBranchInfo, isBranch, type BranchInfo } from "@/lib/branches";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";

export function generateStaticParams() {
  return BRANCHES.map((branch) => ({ branch }));
}

type Params = { branch: string };

const SOCIAL_LABELS: { key: keyof BranchInfo["socials"]; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "threads", label: "Threads" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { branch } = await params;
  if (!isBranch(branch)) return {};
  const branchInfo = getBranchInfo(branch);

  const title = `Contact & Location | ${branchInfo.name}`;
  const description = `${branchInfo.name} - ${branchInfo.street}. ${branchInfo.hoursDisplay}. Order on WhatsApp: ${branchInfo.phoneDisplay}.`;

  return {
    title,
    description,
    alternates: { canonical: `/${branch}/contact` },
    openGraph: {
      title,
      description,
      url: `/${branch}/contact`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  const socials = SOCIAL_LABELS.filter((social) => branchInfo.socials[social.key]);
  const mapsLink = branchInfo.geo
    ? `https://www.google.com/maps/search/?api=1&query=${branchInfo.geo.latitude}%2C${branchInfo.geo.longitude}`
    : null;

  return (
    <>
      <JsonLd schema={bakerySchema(branchInfo)} />

      <Section tone="cream">
        <Breadcrumbs items={[{ name: "Home", href: `/${branch}` }, { name: "Contact" }]} />

        <SectionHeader eyebrow="Contact" title="Get in touch" />

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-8">
            <dl className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-rosewood">WhatsApp &amp; calls</dt>
                <dd>
                  <a
                    href={`tel:${branchInfo.phoneE164}`}
                    className="text-lg text-ink underline-offset-4 hover:text-rosewood hover:underline"
                  >
                    {branchInfo.phoneDisplay}
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-rosewood">Address</dt>
                <dd className="text-base text-ink/80">
                  {branchInfo.street}, {branchInfo.city}, {branchInfo.region}
                </dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-rosewood">Hours</dt>
                <dd className="text-base text-ink/80">{branchInfo.hoursDisplay}</dd>
              </div>

              {socials.length ? (
                <div className="flex flex-col gap-2">
                  <dt className="eyebrow text-rosewood">Social profiles</dt>
                  <dd className="flex flex-wrap gap-x-4 gap-y-2">
                    {socials.map((social) => (
                      <a
                        key={social.key}
                        href={branchInfo.socials[social.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-ink/75 underline-offset-4 hover:text-rosewood hover:underline"
                      >
                        {social.label}
                      </a>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                variant="whatsapp"
                href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
                external
              >
                <WhatsAppIcon />
                Order on WhatsApp
              </ButtonLink>
              {mapsLink ? (
                <ButtonLink variant="outline" href={mapsLink} external>
                  Get directions
                </ButtonLink>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-cream-200">
            {branchInfo.mapEmbedSrc ? (
              <MapEmbed
                src={branchInfo.mapEmbedSrc}
                title={`Map showing ${branchInfo.name}`}
                className="h-72 w-full border-0 lg:h-full lg:min-h-[22rem]"
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center bg-cream-100 text-sm text-ink/60 lg:h-full lg:min-h-[22rem]">
                Map coming soon
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
