import { ButtonLink, WhatsAppIcon } from "@/components/ui/Button";
import type { Branch, BranchInfo } from "@/lib/branches";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/utils/whatsapp";

/**
 * Empty states name the next action instead of reporting "No data" -
 * a customer landing on an empty category should still have a way to
 * order, because the shop can almost certainly still make the cake.
 */
export function EmptyState({
  title,
  body,
  action = "whatsapp",
  branchInfo,
}: {
  title: string;
  body: string;
  action?: "whatsapp" | "gallery" | "none";
  /** Required when action is "whatsapp" or "gallery". */
  branchInfo?: Pick<BranchInfo, "whatsappNumber" | "name"> & { slug: Branch };
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-cream-200 bg-cream-100/60 px-6 py-12 text-center">
      <h3 className="text-lg text-ink">{title}</h3>
      <p className="max-w-md text-base text-ink/70">{body}</p>

      {action === "whatsapp" && branchInfo ? (
        <ButtonLink
          variant="whatsapp"
          href={whatsappLink(branchInfo.whatsappNumber, defaultWhatsappMessage(branchInfo.name))}
          external
          className="mt-2"
        >
          <WhatsAppIcon />
          Ask us on WhatsApp
        </ButtonLink>
      ) : null}

      {action === "gallery" && branchInfo ? (
        <ButtonLink variant="outline" href={`/${branchInfo.slug}/gallery`} className="mt-2">
          Browse the gallery
        </ButtonLink>
      ) : null}
    </div>
  );
}
