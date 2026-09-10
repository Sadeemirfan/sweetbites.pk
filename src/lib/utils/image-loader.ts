import type { ImageLoaderProps } from "next/image";

/**
 * `sharp` doesn't run on Cloudflare Workers, so next/image's default
 * loader can't optimize images at request time. Cloudflare's Image
 * Resizing (`/cdn-cgi/image/...`) is the intended replacement, but it
 * only works on a zone (a real domain in the account) - not on the
 * *.workers.dev preview subdomain, where it 404s. Serving the original
 * file everywhere is a temporary tradeoff (slightly bigger images) until
 * sweetbites.pk is attached and Image Resizing is confirmed on for that
 * zone - re-enable the /cdn-cgi/image/ path below at that point.
 */
export default function cloudflareImageLoader({ src, width }: ImageLoaderProps): string {
  // The width is kept in a harmless query param (ignored by static
  // serving) purely so this loader still varies its output by width,
  // which next/image checks for.
  return `${src}?w=${width}`;
}
