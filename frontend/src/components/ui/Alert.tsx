"use client";

import React from "react";

type AlertTone = "danger" | "success" | "info";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title?: string;
};

export function Alert({ tone = "info", title, className, children, ...props }: AlertProps) {
  const classes = ["ui-alert", "animate-in", className].filter(Boolean).join(" ");

  return (
    <div {...props} className={classes} data-tone={tone}>
      {title ? <div className="ui-alert__title">{title}</div> : null}
      <div className="ui-alert__content">{children}</div>
    </div>
  );
}
