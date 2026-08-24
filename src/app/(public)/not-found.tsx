import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { DEFAULT_WHATSAPP_MESSAGE, whatsappLink } from "@/lib/utils/whatsapp";

export default function NotFound() {
  return (
    <Section tone="cream">
      <div className="flex max-w-md flex-col items-start gap-5 py-10">
        <span className="eyebrow text-rosewood">Page not found</span>
        <h1 className="text-xl text-ink md:text-2xl">This page isn&apos;t here</h1>
        <p className="text-base text-ink/70">
          The cake or page you were looking for may have been renamed or taken down. The gallery
          has everything we currently make, with prices.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink variant="primary" href="/gallery">
            Browse the gallery
          </ButtonLink>
          <ButtonLink variant="whatsapp" href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)} external>
            <WhatsAppIcon />
            Ask us on WhatsApp
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
