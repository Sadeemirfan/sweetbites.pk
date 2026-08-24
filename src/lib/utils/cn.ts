import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class joiner used across the site.
 *
 * twMerge matters for the shadcn/ui components in the admin: they rely
 * on a later `className` overriding an earlier utility of the same kind
 * (`p-4` beating a built-in `p-6`). A plain join emits both and lets CSS
 * order decide, which silently breaks those overrides.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
