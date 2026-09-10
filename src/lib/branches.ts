/**
 * Sweet Bites has three locations sharing this one codebase - Arifwala
 * (the original, with the admin dashboard), Lahore, and Pattoki. Every
 * public route is parameterised by `[branch]`, and this file is the one
 * place that says what each branch actually is.
 *
 * Lahore and Pattoki have no admin dashboard - there is nowhere for the
 * owner to edit these facts, so unlike `site_settings` (Arifwala-only,
 * admin-editable) this is plain code. Changing a phone number or address
 * here means changing this file and redeploying.
 */

export const BRANCHES = ["arifwala", "lahore", "pattoki"] as const;
export type Branch = (typeof BRANCHES)[number];

export function isBranch(value: string): value is Branch {
  return (BRANCHES as readonly string[]).includes(value);
}

export type BranchInfo = {
  slug: Branch;
  name: string;
  shortName: string;
  tagline: string;
  phoneDisplay: string;
  phoneE164: string;
  whatsappNumber: string;
  street: string;
  city: string;
  region: string;
  country: string;
  hoursDisplay: string;
  opens: string;
  closes: string;
  currency: string;
  geo: { latitude: number; longitude: number } | null;
  mapEmbedSrc: string | null;
  /**
   * Only used for Lahore and Pattoki - Arifwala's menu photo is admin-
   * uploadable (site_settings.menu_image_url) since it has a dashboard.
   * The other two don't, so their photo lives here as plain config.
   */
  menuImageUrl: string | null;
  socials: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    threads?: string;
    pinterest?: string;
    whatsappChannel?: string;
  };
};

export const BRANCH_INFO: Record<Branch, BranchInfo> = {
  arifwala: {
    slug: "arifwala",
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
    geo: { latitude: 30.2943354, longitude: 73.0824916 },
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.9903831620663!2d73.0824916!3d30.2943354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393d395ee42e736d%3A0xe18cae8bea6e4f41!2sSweet%20Bites%20Arifwala!5e0!3m2!1sen!2s!4v1787467668101!5m2!1sen!2s",
    // Arifwala's real menu photo lives in site_settings, admin-uploaded -
    // this field is never read for this branch.
    menuImageUrl: null,
    socials: {
      instagram: "https://www.instagram.com/sweetbitesarifwala",
      facebook: "https://www.facebook.com/share/1DVa1Ts72W/",
      tiktok: "https://www.tiktok.com/@sweetbitesarifwala",
      youtube: "https://www.youtube.com/@SweetbitesArifwala-p8q",
      threads: "https://www.threads.com/@sweetbitesarifwala",
      pinterest: "https://pin.it/10Iox8eI7",
      whatsappChannel: "https://whatsapp.com/channel/0029VbBtO961NCrZLBWTND0l",
    },
  },
  // Phone, address, map pin, and social links confirmed against the
  // branch's own profiles. Menu photo is still PLACEHOLDER - waiting on
  // the owner.
  lahore: {
    slug: "lahore",
    name: "Sweet Bites Lahore",
    shortName: "Sweet Bites",
    tagline: "Lahore's own homemade cake studio",
    phoneDisplay: "0327 1024930",
    phoneE164: "+923271024930",
    whatsappNumber: "923271024930",
    street: "Pico Road, near Model Town Link Road, Habib Homes, Kot Lakhpat",
    city: "Lahore",
    region: "Punjab",
    country: "PK",
    hoursDisplay: "8:00 AM – 10:00 PM, all seven days",
    opens: "08:00",
    closes: "22:00",
    currency: "PKR",
    geo: { latitude: 31.4640443, longitude: 74.3197872 },
    // Anchored to the real Google Business Profile place ID (not a bare
    // coordinate pin), same as Arifwala's embed.
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.99!2d74.3197872!3d31.4640443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391907c45541ca93%3A0xb94232dc7991d329!2sSweet%20Bites%20Lahore!5e0!3m2!1sen!2s!4v1789000000000!5m2!1sen!2s",
    menuImageUrl: null,
    socials: {
      instagram: "https://www.instagram.com/sweetbiteslahore/",
      facebook: "https://www.facebook.com/sweetbiteslahore",
      tiktok: "https://www.tiktok.com/@sweetbiteslahore",
    },
  },
  // Phone, address, map pin, and social links confirmed against the
  // branch's own profiles. Menu photo is still PLACEHOLDER - waiting on
  // the owner.
  pattoki: {
    slug: "pattoki",
    name: "Sweet Bites Pattoki",
    shortName: "Sweet Bites",
    tagline: "Pattoki's own homemade cake studio",
    phoneDisplay: "0328 9082819",
    phoneE164: "+923289082819",
    whatsappNumber: "923289082819",
    street: "Street No. 2, Old Mandi",
    city: "Pattoki",
    region: "Punjab",
    country: "PK",
    hoursDisplay: "8:00 AM – 10:00 PM, all seven days",
    opens: "08:00",
    closes: "22:00",
    currency: "PKR",
    geo: { latitude: 31.0166728, longitude: 73.8504571 },
    // Anchored to the real Google Business Profile place ID (not a bare
    // coordinate pin), same as Arifwala's embed.
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.99!2d73.8504571!3d31.0166728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3918419373493de3%3A0x51a5ad01357eae93!2sSweet%20Bites%20Pattoki!5e0!3m2!1sen!2s!4v1789000000000!5m2!1sen!2s",
    menuImageUrl: null,
    socials: {
      instagram: "https://www.instagram.com/sweetbitespattoki",
      facebook: "https://www.facebook.com/share/187DZj8feC/",
      tiktok: "https://www.tiktok.com/@sweetbitespattoki",
      whatsappChannel: "https://whatsapp.com/channel/0029Vb7bW0CEKyZPYQYUJN0T",
    },
  },
};

export function getBranchInfo(branch: Branch): BranchInfo {
  return BRANCH_INFO[branch];
}
