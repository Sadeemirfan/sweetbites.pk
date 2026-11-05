"use client";

import React from "react";
import { trackEvent, type TrackEventConfig } from "@/lib/analytics";

export interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  trackEvent?: TrackEventConfig;
}

export function TrackedLink({
  trackEvent: eventConfig,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        if (eventConfig) {
          trackEvent(eventConfig.name, eventConfig.params);
        }
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
