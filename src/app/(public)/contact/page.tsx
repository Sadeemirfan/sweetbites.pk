import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { MapEmbed, MAPS_LINK } from "@/components/sections/LocationHours";
import { JsonLd } from "@/components/seo/JsonLd";
import { bakerySchema } from "@/lib/seo/jsonld";
import { BUSINESS } from "@/lib/constants";
import { DEFAULT_WHATSAPP_MESSAGE, whatsappLink } from "@/lib/utils/whatsapp";
import { getDeliveryAreas } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Contact & Location | Sweet Bites Arifwala",
  description:
    "Sweet Bites Arifwala - Near Masjid Riaz-ul-Jannah, Gulshan-e-Wahab Phase 2. Open 8:00 AM to 10:00 PM, seven days. Order on WhatsApp: 0321 7337801.",
  alternates: { canonical: "/contact" },
};

const SOCIALS = [
  { label: "Instagram", href: BUSINESS.socials.instagram },
  { label: "Facebook", href: BUSINESS.socials.facebook },
  { label: "TikTok", href: BUSINESS.socials.tiktok },
  { label: "Threads", href: BUSINESS.socials.threads },
];

export default async function ContactPage() {
  const areas = await getDeliveryAreas();
  const insideCity = areas.filter((area) => area.is_inside_city);
  const outside = areas.filter((area) => !area.is_inside_city);

  return (
    <>
      <JsonLd schema={bakerySchema()} />

      <Section tone="cream">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Contact" }]} />

        <SectionHeader
          eyebrow="Contact"
          title="Come by, or just message us"
          lead="WhatsApp is the fastest way to reach us - it is where most orders happen."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-8">
            <dl className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-rosewood">WhatsApp &amp; calls</dt>
                <dd className="text-lg text-ink">
                  <a
                    href={`tel:${BUSINESS.phoneE164}`}
                    className="underline-offset-4 hover:text-rosewood hover:underline"
                  >
                    {BUSINESS.phoneDisplay}
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-rosewood">Address</dt>
                <dd className="max-w-sm text-base text-ink/80">
                  {BUSINESS.street}, {BUSINESS.city}, {BUSINESS.region}
                </dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-rosewood">Hours</dt>
                <dd className="text-base text-ink/80">{BUSINESS.hoursDisplay}</dd>
              </div>

              <div className="flex flex-col gap-2">
                <dt className="eyebrow text-rosewood">Follow us</dt>
                <dd className="flex flex-wrap gap-2">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-md border border-cream-200 px-4 text-sm text-ink transition-colors hover:border-rosewood hover:text-rosewood"
                    >
                      {social.label}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                variant="whatsapp"
                href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                external
              >
                <WhatsAppIcon />
                Order on WhatsApp
              </ButtonLink>
              <ButtonLink variant="outline" href={MAPS_LINK} external>
                Get directions
              </ButtonLink>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-lg border border-cream-200">
              <MapEmbed className="h-72 w-full border-0" />
            </div>

            {areas.length ? (
              <div className="rounded-lg border border-cream-200 bg-cream-100 p-5">
                <h2 className="text-lg text-ink">Where we deliver</h2>
                {insideCity.length ? (
                  <div className="mt-3">
                    <p className="eyebrow text-rosewood">Free inside Arifwala</p>
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
