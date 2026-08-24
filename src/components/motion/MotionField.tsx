"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/useMotion";
import { cn } from "@/lib/utils/cn";

/**
 * §14 - label rises on focus, --ghee ring, one 150ms shake on error.
 *
 * "One shake" is literal: the animation is keyed on the error text, so a
 * field shakes when an error appears and then stays still, rather than
 * juddering on every keystroke while the message is up.
 */
export function MotionField({
  label,
  error,
  type = "text",
  multiline,
  className,
  ...props
}: {
  label: string;
  error?: string | null;
  multiline?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const reducedMotion = usePrefersReducedMotion();
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(props.defaultValue ?? props.value));

  const raised = focused || hasValue;

  const shared = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    onFocus: () => setFocused(true),
    onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(false);
      setHasValue(Boolean(event.target.value));
    },
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setHasValue(Boolean(event.target.value));
      props.onChange?.(event as never);
    },
    className: cn(
      "w-full rounded-md border bg-cream-50 px-3 pb-2 pt-6 text-base text-ink outline-none transition-colors",
      error ? "border-danger" : "border-cream-200 focus:border-rosewood",
      // §14 - the ghee ring.
      "focus:ring-2 focus:ring-ghee/60",
      multiline ? "min-h-28 resize-y" : "min-h-14",
      className
    ),
  };

  return (
    <motion.div
      className="relative"
      // The 150ms shake, fired once per distinct error message.
      key={error ?? "no-error"}
      animate={
        error && !reducedMotion ? { x: [0, -5, 5, -3, 0] } : { x: 0 }
      }
      transition={{ duration: 0.15, ease: "easeInOut" }}
    >
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 z-10 origin-left text-ink/55 transition-all duration-200",
          raised ? "top-1.5 text-xs" : "top-1/2 -translate-y-1/2 text-base",
          reducedMotion && "transition-none"
        )}
      >
        {label}
      </label>

      {multiline ? (
        <textarea {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} {...shared} />
      ) : (
        <input
          type={type}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          {...shared}
        />
      )}

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </motion.div>
  );
}
