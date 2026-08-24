"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/useMotion";
import { cn } from "@/lib/utils/cn";

/**
 * §14 - product cards: hover tilt max 5°, image scale 1.04, price
 * underline draws in --ghee.
 *
 * The card provides `--card-hover` (0 or 1) to its children so the image
 * scale and the underline can be driven from plain CSS rather than
 * three separate motion components. Pointer-only and off under reduced
 * motion.
 */
const MAX_TILT = 5;

export function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 260, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 260, damping: 22 });

  const transform = useTransform(
    [springX, springY],
    ([x, y]: number[]) => `perspective(900px) rotateX(${x}deg) rotateY(${y}deg)`
  );

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse" || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(px * MAX_TILT * 2);
    rotateX.set(-py * MAX_TILT * 2);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={reset}
      style={{
        transform: reducedMotion ? undefined : transform,
        // Consumed by the image and the price underline.
        ["--card-hover" as string]: hovered && !reducedMotion ? 1 : 0,
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
