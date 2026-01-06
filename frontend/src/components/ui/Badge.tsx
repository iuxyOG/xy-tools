"use client";

import React from "react";

type BadgeTone = "neutral" | "success" | "warning" | "brand";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  dot?: boolean;
};

export function Badge({ tone = "neutral", dot = false, className, children, ...props }: BadgeProps) {
  const classes = ["badge", "ui-badge", className].filter(Boolean).join(" ");

  return (
    <span {...props} className={classes} data-tone={tone}>
      {dot ? <span className="ui-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
