import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

// NOTE: `shadcn add` rewrites this file to install Geist and a
// `font-sans` class. That was reverted - §2.4 fixes the typefaces as
// Fraunces + Instrument Sans, and shadcn is admin-only chrome, not a
// licence to change the site's fonts. Re-check this block if the CLI is
// ever run again.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Homemade Cakes in Arifwala | Sweet Bites",
    // §15 pattern: "Custom Birthday Cakes in Arifwala | Sweet Bites"
    template: "%s",
  },
  description:
    "Homemade, made-to-order cakes in Arifwala, Punjab. Every cake is baked after you order it.",
  openGraph: {
    type: "website",
    siteName: "Sweet Bites Arifwala",
    locale: "en_PK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
