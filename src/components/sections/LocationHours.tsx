import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/Section";
import { BUSINESS } from "@/lib/constants";
import { DEFAULT_WHATSAPP_MESSAGE, whatsappLink } from "@/lib/utils/whatsapp";

/**
 * Google's own embed for the shop's Business Profile listing, supplied
 * by the owner. It carries the real place ID
 * (0x393d395ee42e736d:0xe18cae8bea6e4f41), so the pin lands on Sweet
 * Bites itself rather than on a geocoded guess at the street.
 */
const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.9903831620663!2d73.0824916!3d30.2943354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393d395ee42e736d%3A0xe18cae8bea6e4f41!2sSweet%20Bites%20Arifwala!5e0!3m2!1sen!2s!4v1787467668101!5m2!1sen!2s";

/**
 * "Get directions" - opens the Maps app at the shop's coordinates.
 * Coordinates rather than a place ID: the ID is only available here in
 * its hex form inside the embed URL, and guessing at the encoded version
 * would risk sending customers somewhere else entirely.
 */
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${BUSINESS.geo.latitude}%2C${BUSINESS.geo.longitude}`;

/** Lazy, so it costs nothing on mobile data until it is scrolled to. */
export function MapEmbed({ className }: { className?: string }) {
  return (
    <iframe
      title={`Map showing ${BUSINESS.name}`}
      src={MAP_EMBED_SRC}
      loading="lazy"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className={className}
    />
  );
}

export function LocationHours() {
  return (
    <section className="wipe-t bg-rosewood-d pb-16 pt-[calc(var(--wipe-h)+4rem)] text-cream-100 md:pb-24 md:pt-[calc(var(--wipe-h)+6rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col items-start gap-6">
            <SectionHeader eyebrow="Find us" title="Gulshan-e-Wahab, Arifwala" tone="dark" />

            <dl className="flex flex-col gap-5 text-base">
              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-cream-200">Address</dt>
                <dd className="max-w-xs text-cream-100">
                  {BUSINESS.street}, {BUSINESS.city}, {BUSINESS.region}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-cream-200">Hours</dt>
                <dd className="text-cream-100">{BUSINESS.hoursDisplay}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="eyebrow text-cream-200">WhatsApp &amp; calls</dt>
                <dd>
                  <a
                    href={`tel:${BUSINESS.phoneE164}`}
                    className="text-cream-100 underline-offset-4 hover:text-ghee hover:underline"
                  >
                    {BUSINESS.phoneDisplay}
                  </a>
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
              <ButtonLink variant="outline-dark" href={MAPS_LINK} external>
                Get directions
              </ButtonLink>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-cream-100/15">
            <MapEmbed className="h-64 w-full border-0 md:h-full md:min-h-[20rem]" />
          </div>
        </div>
      </div>
    </section>
  );
}
