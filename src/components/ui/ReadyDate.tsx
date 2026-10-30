"use client";

import { useEffect, useState } from "react";
import { earliestDate } from "@/lib/availability";
import { formatLongDate } from "@/lib/utils/format";
import { LEAD_TIME } from "@/lib/constants";

type Props = {
  /**
   * lead_time_days from the product row (§8 rule 1). Defaults to the
   * standard 2-day lead time when omitted (e.g. on the Hero).
   */
  leadTimeDays?: number;
  /**
   * SSR/first-paint fallback text shown until JS runs and produces the
   * real date. Must match the surrounding sentence so a flash of stale
   * content reads as intentional rather than broken.
   *
   * Default: "within {leadTimeDays} days" - vague enough to be safe on
   * any day of the week and accurate enough to set expectations.
   */
  fallback?: string;
  /** Extra class names applied to the wrapping <span>. */
  className?: string;
};

/**
 * Renders the "earliest ready" date computed client-side so the value is
 * always today's date, never a build-time or edge-cache snapshot.
 *
 * Root cause of the staleness bug: Next.js 15 with @opennextjs/cloudflare
 * statically pre-renders server components at `next build`. Even without
 * an explicit `export const dynamic = "force-static"`, a server component
 * that has no dynamic data signals (cookies, headers, searchParams, fetch
 * with no-store) can be inlined into the HTML bundle at build time. The
 * hero and product pages have no such signals, so their RSC output is
 * frozen. Cloudflare then serves that frozen HTML from its edge cache for
 * the lifetime of the deployment, meaning `new Date()` is permanently
 * stuck at the build instant rather than the visitor's request time.
 *
 * The fix is structural: move the date computation to the client, where
 * `new Date()` always reflects right now. The pure `earliestDate()`
 * function from `src/lib/availability.ts` runs fine in the browser
 * (it uses `Intl.DateTimeFormat` with Asia/Karachi, which every modern
 * browser supports). The SSR pass renders the `fallback` prop, which
 * is intentionally non-specific so there is no hydration mismatch even
 * if the server and client disagree on the calendar date.
 */
export function ReadyDate({ leadTimeDays = LEAD_TIME.standard, fallback, className }: Props) {
  const resolvedFallback = fallback ?? `within ${leadTimeDays} ${leadTimeDays === 1 ? "day" : "days"}`;

  // Start with the fallback on the server and on the initial client paint.
  // The real date replaces it after the first effect, which is always
  // after hydration completes - eliminating the mismatch warning.
  const [dateLabel, setDateLabel] = useState<string>(resolvedFallback);

  useEffect(() => {
    setDateLabel(formatLongDate(earliestDate(leadTimeDays)));
  }, [leadTimeDays]);

  return <span className={className}>{dateLabel}</span>;
}
