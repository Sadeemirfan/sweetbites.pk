/** Business facts - PLAN.md §0. Single source for every page and schema. */

export const BUSINESS = {
  name: "Sweet Bites Arifwala",
  shortName: "Sweet Bites",
  tagline: "Arifwala's own homemade cake studio",
  phoneDisplay: "0321 7337801",
  phoneE164: "+923217337801",
  whatsappNumber: "923217337801",
  street: "Near Masjid Riaz-ul-Jannah, Gulshan-e-Wahab Phase 2",
  city: "Arifwala",
  region: "Punjab",
  country: "PK",
  hoursDisplay: "8:00 AM – 10:00 PM, all seven days",
  opens: "08:00",
  closes: "22:00",
  currency: "PKR",
  // The shop's real pin, taken from its Google Business Profile listing.
  // Local search results key off this, so it must stay in step with the
  // embed URL in LocationHours.
  geo: { latitude: 30.2943354, longitude: 73.0824916 },
  // All real, owner-supplied profiles. The share/tracking parameters the
  // apps append (?igsi=, ?_r=, ?_t=) are stripped: they are per-device
  // referral tokens, not part of the address, and they age out.
  socials: {
    instagram: "https://www.instagram.com/sweetbitesarifwala",
    facebook: "https://www.facebook.com/share/1DVa1Ts72W/",
    tiktok: "https://www.tiktok.com/@sweetbitesarifwala",
    youtube: "https://www.youtube.com/@SweetbitesArifwala-p8q",
    threads: "https://www.threads.com/@sweetbitesarifwala",
    pinterest: "https://pin.it/10Iox8eI7",
    whatsappChannel: "https://whatsapp.com/channel/0029VbBtO961NCrZLBWTND0l",
  },
} as const;

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
