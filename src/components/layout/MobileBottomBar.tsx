import { WhatsAppCta } from "@/components/layout/WhatsAppCta";

export function MobileBottomBar() {
  return (
    // Matches the header breakpoint: the header CTA only appears at lg,
    // so the sticky bar carries the WhatsApp action below that.
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-200 bg-cream-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <WhatsAppCta tone="whatsapp" className="flex w-full" />
    </div>
  );
}
