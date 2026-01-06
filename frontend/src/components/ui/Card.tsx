"use client";

import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  const classes = ["surface", "ui-card", className].filter(Boolean).join(" ");
  return <div {...props} className={classes} />;
}
