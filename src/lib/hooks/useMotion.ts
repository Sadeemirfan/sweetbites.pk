"use client";

import { useEffect, useState } from "react";

/**
 * §14 - `prefers-reduced-motion: reduce` turns all motion off, layout
 * intact. Every animated component in the public site reads this and
 * renders its end state directly rather than animating to it.
 *
 * Starts `true` so the first server-rendered paint is the still layout;
 * animation only begins once the client has confirmed it's welcome.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * §14 - "Mobile or deviceMemory < 4 → skip 3D entirely."
 *
 * Most Sweet Bites customers open the site on a phone on mobile data in
 * Arifwala, and a laggy hero costs orders. So this is deliberately
 * pessimistic: it returns false during SSR and on the first client
 * paint, and only flips true once the device has actually proven it can
 * take it. The static hero art renders in the meantime, which is also
 * what keeps CLS at zero - both occupy the same box.
 */
export function useCanRender3D(): boolean {
  const [allowed, setAllowed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setAllowed(false);
      return;
    }

    // A coarse pointer means touch - the §14 "mobile" test. Paired with
    // a width check so a small laptop window doesn't get excluded.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isNarrow = window.matchMedia("(max-width: 1023px)").matches;

    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowMemory = typeof memory === "number" && memory < 4;

    // Chrome-only signal; absent elsewhere, which is fine - the other
    // two checks carry the decision.
    setAllowed(!isTouch && !isNarrow && !lowMemory);
  }, [reducedMotion]);

  return allowed;
}
