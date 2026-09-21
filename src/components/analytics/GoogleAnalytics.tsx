import Script from "next/script";

// The measurement ID is public - it ships in the page source either way,
// so there is nothing to gain from routing it through an env var.
const GA_MEASUREMENT_ID = "G-ZZB0GZKDTP";

/**
 * Mounted on the public pages only, never under /admin - the owner works
 * in the dashboard daily and those visits would drown out real traffic.
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
