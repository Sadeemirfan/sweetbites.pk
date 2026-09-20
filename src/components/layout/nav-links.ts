import type { Branch } from "@/lib/branches";
import { SHOWCASE_IMAGES } from "@/lib/showcase";

export function navLinks(branch: Branch) {
  const links = [
    { label: "Gallery", href: `/${branch}/gallery` },
    { label: "Menu", href: `/${branch}/menu` },
    { label: "Reviews", href: `/${branch}/reviews` },
    { label: "Blog", href: `/${branch}/blog` },
    { label: "About", href: `/${branch}/about` },
    { label: "Contact", href: `/${branch}/contact` },
  ];

  // Only linked once a branch actually has photos to show.
  if (SHOWCASE_IMAGES[branch].length > 0) {
    links.splice(2, 0, { label: "Our Work", href: `/${branch}/our-work` });
  }

  return links;
}
