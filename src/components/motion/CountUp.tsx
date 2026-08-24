"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/useMotion";

/**
 * §14 - stats count up on in-view.
 *
 * Renders the final value immediately under reduced motion, and always
 * exposes it to assistive tech as a single settled number rather than a
 * stream of changing text.
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  className,
  durationMs = 900,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  durationMs?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reducedMotion || !inView) return;

    let frame = 0;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // Ease-out so it decelerates into the final figure.
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, value, durationMs]);

  const shown = reducedMotion || !inView ? value : display;

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {shown.toFixed(decimals)}
        {suffix}
      </span>
      <span className="sr-only">
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}
