import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { SOURCE_LABELS, STATUS_CLASSES, STATUS_LABELS } from "@/lib/admin/constants";

/** Page header used by every admin screen, with room for one action. */
export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cream-200 bg-cream-100 px-4 py-4 md:px-6">
      <div className="min-w-0">
        <h1 className="text-lg font-medium text-ink">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-ink/60">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusDot({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", STATUS_CLASSES[status], className)}
      aria-hidden="true"
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-cream-100 px-2 py-0.5 text-xs text-ink">
      <StatusDot status={status} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/**
 * §12 - every order in a list carries its channel badge, because most
 * orders do not come from the website and the baker needs to see at a
 * glance where each one arrived from.
 */
export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-cream-200 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-ink/65">
      {SOURCE_LABELS[source] ?? source}
    </span>
  );
}

/** First orders and unpaid advances have to be visible without opening the order. */
export function OrderFlags({
  isFirstOrder,
  advanceRequired,
  paymentStatus,
}: {
  isFirstOrder: boolean;
  advanceRequired: boolean;
  paymentStatus: string;
}) {
  const advanceOutstanding = advanceRequired && paymentStatus !== "paid";

  return (
    <>
      {isFirstOrder ? (
        <span className="inline-flex items-center rounded-sm bg-rosewood/15 px-1.5 py-0.5 text-[11px] font-medium text-rosewood-d">
          1st order
        </span>
      ) : null}
      {advanceOutstanding ? (
        <span className="inline-flex items-center rounded-sm bg-danger/15 px-1.5 py-0.5 text-[11px] font-medium text-danger">
          Advance due
        </span>
      ) : null}
    </>
  );
}

export function EmptyRow({ children, href, cta }: { children: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
      <p>{children}</p>
      {href && cta ? (
        <Link
          href={href}
          className="inline-flex min-h-11 items-center rounded-md bg-rosewood px-4 text-sm font-medium text-cream-50"
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}
