import type { Branch } from "@/lib/branches";

export function navLinks(branch: Branch) {
  return [
    { label: "Gallery", href: `/${branch}/gallery` },
    { label: "Menu", href: `/${branch}/menu` },
    { label: "Reviews", href: `/${branch}/reviews` },
    { label: "Blog", href: `/${branch}/blog` },
    { label: "About", href: `/${branch}/about` },
    { label: "Contact", href: `/${branch}/contact` },
  ] as const;
}
