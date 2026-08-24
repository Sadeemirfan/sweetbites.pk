import type { ImageLoaderProps } from "next/image";

/**
 * `sharp` doesn't run on Cloudflare Workers, so next/image's default
 * loader can't optimize images at request time. This loader defers to
 * Cloudflare's Image Resizing (`/cdn-cgi/image/...`), which is free to
 * enable on any zone proxied through Cloudflare. In dev it's a no-op so
 * `next dev` keeps serving images directly.
 */
export default function cloudflareImageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (process.env.NODE_ENV === "development") {
    // No Cloudflare proxy locally - serve the file as-is. The width is kept
    // in a harmless query param (ignored by static serving) purely so this
    // loader still varies its output by width, which next/image checks for.
    return `${src}?w=${width}`;
  }

  const params = [`width=${width}`, `quality=${quality ?? 75}`, "format=auto"];
  return `/cdn-cgi/image/${params.join(",")}${src.startsWith("/") ? "" : "/"}${src}`;
}
