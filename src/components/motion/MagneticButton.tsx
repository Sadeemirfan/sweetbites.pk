"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/useMotion";
import { cn } from "@/lib/utils/cn";

/**
 * §14 - magnetic pull within 40px, fill wipe from the left.
 *
 * Pointer-only: the magnet is meaningless without a cursor, and the
 * listeners are skipped entirely on touch so a phone pays nothing for
 * it. Reduced motion drops both effects and leaves a normal button.
 */
const PULL_RADIUS = 40;
const PULL_STRENGTH = 0.32;
// Hard cap on the pull itself, not just the radius that triggers it - the
// two buttons in the Hero sit close under a paragraph, and without this
// a cursor approaching from directly above could pull a button up far
// enough to visually collide with the text.
const MAX_PULL_PX = 14;

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

export function MagneticLink({
  href,
  external,
  children,
  className,
  fillClassName = "bg-cream-50/15",
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
  /** The wipe colour - lighter over dark buttons, darker over light. */
  fillClassName?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.35 });

  function onPointerMove(event: React.PointerEvent<HTMLAnchorElement>) {
    if (reducedMotion || event.pointerType !== "mouse" || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centreX = rect.left + rect.width / 2;
    const centreY = rect.top + rect.height / 2;
    const dx = event.clientX - centreX;
    const dy = event.clientY - centreY;

    // Only pull once the cursor is inside the 40px band around the
    // button; outside it the button stays put.
    const distance = Math.hypot(
      Math.max(0, Math.abs(dx) - rect.width / 2),
      Math.max(0, Math.abs(dy) - rect.height / 2)
    );

    if (distance > PULL_RADIUS) {
      x.set(0);
      y.set(0);
      return;
    }

    x.set(clamp(dx * PULL_STRENGTH, MAX_PULL_PX));
    y.set(clamp(dy * PULL_STRENGTH, MAX_PULL_PX));
  }

  function reset() {
    x.set(0);
    y.set(0);
    setHovered(false);
  }

  const anchorProps = external
    ? { target: "_blank", rel: "noopener noreferrer" as const }
    : {};

  return (
    <motion.a
      ref={ref}
      href={href}
      {...anchorProps}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={reset}
      className={cn("relative isolate overflow-hidden", className)}
    >
      {!reducedMotion ? (
        <motion.span
          aria-hidden="true"
          className={cn("absolute inset-0 -z-10 origin-left", fillClassName)}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : null}
      {children}
    </motion.a>
  );
}
