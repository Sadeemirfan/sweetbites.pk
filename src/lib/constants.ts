/**
 * Canonical origin for metadata and OG URLs. Follows the env var so a
 * preview deployment describes itself correctly.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sweetbites.pk";

/**
 * Origin used inside WhatsApp order messages. Deliberately NOT the env
 * var - a localhost link pasted into the shop's WhatsApp is useless, so
 * these always point at production regardless of where the page runs.
 */
export const ORDER_LINK_ORIGIN = "https://sweetbites.pk";

/** Lead times in days - PLAN.md §8. */
export const LEAD_TIME = {
  standard: 2,
  custom: 3,
  /** Orders placed after this hour (Asia/Karachi) add one more day. */
  cutoffHour: 18,
} as const;
