/**
 * Google Analytics (gtag) event tracking helpers.
 * - Measurement ID: G-ZZB0GZKDTP (defined in GoogleAnalytics.tsx)
 * - Safe if window is undefined (SSR) or window.gtag is not loaded/initialized.
 * - Suppressed under /admin to prevent staff visits from skewing metrics.
 */

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type WhatsAppClickParams = {
  branch: string;
  location: string;
  page_path?: string;
  product?: string;
};

export type PhoneClickParams = {
  branch: string;
  location: string;
  phone_number?: string;
  page_path?: string;
};

export type DirectionsClickParams = {
  branch: string;
  location: string;
  page_path?: string;
};

export type EventParams = Record<string, string | number | boolean | null | undefined>;

export type TrackEventConfig = {
  name: "whatsapp_click" | "phone_click" | "directions_click" | string;
  params: EventParams;
};

export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  if (typeof window.gtag !== "function") return;

  const cleanedParams: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        cleanedParams[key] = value;
      }
    }
  }

  // Populate page_path automatically if not explicitly provided
  if (!cleanedParams.page_path && typeof window !== "undefined" && window.location.pathname) {
    cleanedParams.page_path = window.location.pathname;
  }

  window.gtag("event", eventName, cleanedParams);
}

export function trackWhatsAppClick(params: WhatsAppClickParams): void {
  trackEvent("whatsapp_click", params);
}

export function trackPhoneClick(params: PhoneClickParams): void {
  trackEvent("phone_click", params);
}

export function trackDirectionsClick(params: DirectionsClickParams): void {
  trackEvent("directions_click", params);
}
