import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { MapEmbed } from "@/components/sections/LocationHours";
import { JsonLd } from "@/components/seo/JsonLd";
import { bakerySchema } from "@/lib/seo/jsonld";
import { getBranchInfo, isBranch, type BranchInfo } from "@/lib/branches";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";
import { getDeliveryAreas } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils/format";

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

  return {
    title: `Contact & Location | ${branchInfo.name}`,
    description: `${branchInfo.name} - ${branchInfo.street}. ${branchInfo.hoursDisplay}. Order on WhatsApp: ${branchInfo.phoneDisplay}.`,
    alternates: { canonical: `/${branch}/contact` },
  };
}

export default async function ContactPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  if (!isBranch(branch)) notFound();
  const branchInfo = getBranchInfo(branch);

  const areas = await getDeliveryAreas(branch);
  const insideCity = areas.filter((area) => area.is_inside_city);
  const outside = areas.filter((area) => !area.is_inside_city);

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
                <dd className="text-lg text-ink">
                  <a
                    href={`tel:${branchInfo.phoneE164}`}
                    className="underline-offset-4 hover:text-rosewood hover:underline"
                  >
                    {branchInfo.phoneDisplay}
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-rosewood">Address</dt>
                <dd className="max-w-sm text-base text-ink/80">
                  {branchInfo.street}, {branchInfo.city}, {branchInfo.region}
                </dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-rosewood">Hours</dt>
                <dd className="text-base text-ink/80">{branchInfo.hoursDisplay}</dd>
              </div>

              {socials.length ? (
                <div className="flex flex-col gap-2">
                  <dt className="eyebrow text-rosewood">Follow us</dt>
                  <dd className="flex flex-wrap gap-2">
                    {socials.map((social) => (
                      <a
                        key={social.key}
                        href={branchInfo.socials[social.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center rounded-md border border-cream-200 px-4 text-sm text-ink transition-colors hover:border-rosewood hover:text-rosewood"
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

          <div className="flex flex-col gap-6">
            {branchInfo.mapEmbedSrc ? (
              <div className="overflow-hidden rounded-lg border border-cream-200">
                <MapEmbed
                  src={branchInfo.mapEmbedSrc}
                  title={`Map showing ${branchInfo.name}`}
                  className="h-72 w-full border-0"
                />
              </div>
            ) : null}

            {areas.length ? (
              <div className="rounded-lg border border-cream-200 bg-cream-100 p-5">
                <h2 className="text-lg text-ink">Where we deliver</h2>
                {insideCity.length ? (
                  <div className="mt-3">
                    <p className="eyebrow text-rosewood">Free inside {branchInfo.city}</p>
                    <p className="mt-1 text-sm text-ink/75">
                      {insideCity.map((area) => area.name).join(" · ")}
                    </p>
                  </div>
                ) : null}
                {outside.length ? (
                  <div className="mt-4">
                    <p className="eyebrow text-rosewood">Nearby areas</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {outside.map((area) => (
                        <li key={area.id} className="flex justify-between gap-4 text-sm">
                          <span className="text-ink/75">{area.name}</span>
                          <span className="text-ghee">{formatPrice(area.fee)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="mt-4 text-sm text-ink/60">
                  Deliveries after 10:00 PM carry an extra charge, including inside the city.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Section>
    </>
  );
}
