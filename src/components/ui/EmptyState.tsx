import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import { DEFAULT_WHATSAPP_MESSAGE, whatsappLink } from "@/lib/utils/whatsapp";

/**
 * Empty states name the next action instead of reporting "No data" -
 * a customer landing on an empty category should still have a way to
 * order, because the shop can almost certainly still make the cake.
 */
export function EmptyState({
  title,
  body,
  action = "whatsapp",
}: {
  title: string;
  body: string;
  action?: "whatsapp" | "gallery" | "none";
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-cream-200 bg-cream-100/60 px-6 py-12 text-center">
      <h3 className="text-lg text-ink">{title}</h3>
      <p className="max-w-md text-base text-ink/70">{body}</p>

      {action === "whatsapp" ? (
        <ButtonLink
          variant="whatsapp"
          href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
          external
          className="mt-2"
        >
          <WhatsAppIcon />
          Ask us on WhatsApp
        </ButtonLink>
      ) : null}

      {action === "gallery" ? (
        <ButtonLink variant="outline" href="/gallery" className="mt-2">
          Browse the gallery
        </ButtonLink>
      ) : null}
    </div>
  );
}
