"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRANCHES, BRANCH_INFO, type Branch } from "@/lib/branches";
import { cn } from "@/lib/utils/cn";

/**
 * Swaps the branch segment in the current path so switching city keeps you
 * on the equivalent page - e.g. /lahore/gallery/cakes -> /arifwala/gallery/cakes.
 */
function pathForBranch(pathname: string, branch: Branch): string {
  const segments = pathname.split("/");
  segments[1] = branch;
  return segments.join("/") || `/${branch}`;
}

export function BranchSwitcher({ current }: { current: Branch }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const others = BRANCHES.filter((branch) => branch !== current);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-rosewood"
      >
        {BRANCH_INFO[current].city}
        <svg
          viewBox="0 0 20 20"
          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-cream-200 bg-cream-50 py-1 shadow-dark"
          >
            {others.map((branch) => (
              <Link
                key={branch}
                href={pathForBranch(pathname, branch)}
                onClick={() => setIsOpen(false)}
                className="flex min-h-11 items-center px-4 text-sm text-ink transition-colors hover:bg-cream-100 hover:text-rosewood"
              >
                {BRANCH_INFO[branch].city}
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
