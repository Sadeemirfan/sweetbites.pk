import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  trackDirectionsClick,
  trackEvent,
  trackPhoneClick,
  trackWhatsAppClick,
} from "@/lib/analytics";

describe("trackEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis as unknown as { window: unknown }).window = {
      location: { pathname: "/arifwala" },
      gtag: undefined,
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it("does nothing when window is undefined (SSR environment)", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => trackEvent("test_event", { foo: "bar" })).not.toThrow();
  });

  it("does nothing when gtag is undefined on window", () => {
    expect(() => trackEvent("test_event", { foo: "bar" })).not.toThrow();
  });

  it("does nothing when on /admin path", () => {
    const gtagMock = vi.fn();
    (globalThis as unknown as { window: { location: { pathname: string }; gtag: unknown } }).window = {
      location: { pathname: "/admin/orders" },
      gtag: gtagMock,
    };

    trackEvent("whatsapp_click", { branch: "arifwala", location: "header" });
    expect(gtagMock).not.toHaveBeenCalled();
  });

  it("calls gtag with cleaned params and auto-fills page_path", () => {
    const gtagMock = vi.fn();
    (globalThis as unknown as { window: { location: { pathname: string }; gtag: unknown } }).window = {
      location: { pathname: "/lahore/gallery" },
      gtag: gtagMock,
    };

    trackEvent("whatsapp_click", {
      branch: "lahore",
      location: "hero",
      nullVal: null,
      undefVal: undefined,
    });

    expect(gtagMock).toHaveBeenCalledTimes(1);
    expect(gtagMock).toHaveBeenCalledWith("event", "whatsapp_click", {
      branch: "lahore",
      location: "hero",
      page_path: "/lahore/gallery",
    });
  });

  it("preserves explicit page_path if provided", () => {
    const gtagMock = vi.fn();
    (globalThis as unknown as { window: { location: { pathname: string }; gtag: unknown } }).window = {
      location: { pathname: "/pattoki" },
      gtag: gtagMock,
    };

    trackEvent("whatsapp_click", {
      branch: "pattoki",
      location: "product_card",
      page_path: "/custom/path",
      product: "Chocolate Fudge",
    });

    expect(gtagMock).toHaveBeenCalledWith("event", "whatsapp_click", {
      branch: "pattoki",
      location: "product_card",
      page_path: "/custom/path",
      product: "Chocolate Fudge",
    });
  });

  it("trackWhatsAppClick fires whatsapp_click", () => {
    const gtagMock = vi.fn();
    (globalThis as unknown as { window: { location: { pathname: string }; gtag: unknown } }).window = {
      location: { pathname: "/arifwala/contact" },
      gtag: gtagMock,
    };

    trackWhatsAppClick({
      branch: "arifwala",
      location: "contact",
    });

    expect(gtagMock).toHaveBeenCalledWith("event", "whatsapp_click", {
      branch: "arifwala",
      location: "contact",
      page_path: "/arifwala/contact",
    });
  });

  it("trackPhoneClick fires phone_click with phone_number", () => {
    const gtagMock = vi.fn();
    (globalThis as unknown as { window: { location: { pathname: string }; gtag: unknown } }).window = {
      location: { pathname: "/arifwala/contact" },
      gtag: gtagMock,
    };

    trackPhoneClick({
      branch: "arifwala",
      location: "contact",
      phone_number: "+923217337801",
    });

    expect(gtagMock).toHaveBeenCalledWith("event", "phone_click", {
      branch: "arifwala",
      location: "contact",
      phone_number: "+923217337801",
      page_path: "/arifwala/contact",
    });
  });

  it("trackDirectionsClick fires directions_click", () => {
    const gtagMock = vi.fn();
    (globalThis as unknown as { window: { location: { pathname: string }; gtag: unknown } }).window = {
      location: { pathname: "/arifwala" },
      gtag: gtagMock,
    };

    trackDirectionsClick({
      branch: "arifwala",
      location: "location_hours",
    });

    expect(gtagMock).toHaveBeenCalledWith("event", "directions_click", {
      branch: "arifwala",
      location: "location_hours",
      page_path: "/arifwala",
    });
  });
});
