"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/useMotion";

/**
 * §14 - hero words, staggered mask reveal on load, 60ms stagger.
 *
 * A mask reveal, not a fade: each word sits in an `overflow-hidden` span
 * and slides up from below its own baseline, so the type appears to be
 * uncovered rather than faded in.
 */
export function HeroWords({ text, className }: { text: string; className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const words = text.split(" ");

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        className="inline"
      >
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="inline-block overflow-hidden align-bottom"
            // Padding stops descenders (g, y) being clipped by the mask.
            style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%" },
                visible: {
                  y: "0%",
                  // Deliberately short. The h1 is the LCP element, and a
                  // mask reveal holds it out of view until it lands - a
                  // 0.7s reveal measured as ~0.9s of extra LCP on
                  // throttled mobile and pushed it past the §14 budget.
                  // §14 is explicit that the budget wins over motion, so
                  // the reveal keeps its mandated 60ms stagger but runs
                  // fast enough to stay inside it.
                  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              {word}
              {index < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </span>
  );
}
