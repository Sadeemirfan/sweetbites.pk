import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/Section";
import type { BranchInfo } from "@/lib/branches";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";

/** Lazy, so it costs nothing on mobile data until it is scrolled to. */
export function MapEmbed({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  return (
    <iframe
      title={title}
      src={src}
      loading="lazy"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className={className}
    />
  );
}

export function LocationHours({ branchInfo }: { branchInfo: BranchInfo }) {
  // Coordinates rather than a place ID: the ID is only available in hex
  // form inside a map embed URL, and guessing at the encoded version
  // would risk sending customers somewhere else entirely. Lahore and
  // Pattoki don't have a pin yet, so "Get directions" waits for one.
  const mapsLink = branchInfo.geo
    ? `https://www.google.com/maps/search/?api=1&query=${branchInfo.geo.latitude}%2C${branchInfo.geo.longitude}`
    : null;

  return (
    <section className="wipe-t bg-rosewood-d pb-16 pt-[calc(var(--wipe-h)+4rem)] text-cream-100 md:pb-24 md:pt-[calc(var(--wipe-h)+6rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col items-start gap-6">
            <SectionHeader eyebrow="Find us" title={branchInfo.city} tone="dark" />

            <dl className="flex flex-col gap-5 text-base">
              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-cream-200">Address</dt>
                <dd className="max-w-xs text-cream-100">
                  {branchInfo.street}, {branchInfo.city}, {branchInfo.region}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-cream-200">Hours</dt>
                <dd className="text-cream-100">{branchInfo.hoursDisplay}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-cream-200">WhatsApp &amp; calls</dt>
                <dd>
                  <a
                    href={`tel:${branchInfo.phoneE164}`}
                    className="text-cream-100 underline-offset-4 hover:text-ghee hover:underline"
                  >
                    {branchInfo.phoneDisplay}
                  </a>
                </dd>
              </div>
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
                <ButtonLink variant="outline-dark" href={mapsLink} external>
                  Get directions
                </ButtonLink>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-cream-100/15">
            {branchInfo.mapEmbedSrc ? (
              <MapEmbed
                src={branchInfo.mapEmbedSrc}
                title={`Map showing ${branchInfo.name}`}
                className="h-64 w-full border-0 md:h-full md:min-h-[20rem]"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-cream-100/10 text-sm text-cream-200 md:h-full md:min-h-[20rem]">
                Map coming soon
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
