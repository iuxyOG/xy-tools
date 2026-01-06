"use client";

import React from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ variant = "ghost", loading = false, className, disabled, children, ...props }: ButtonProps) {
  const classes = ["btn", variant === "primary" ? "btn-primary" : "", "ui-button", className].filter(Boolean).join(" ");

  return (
    <button
      {...props}
      className={classes}
      data-loading={loading ? "true" : "false"}
      aria-busy={loading}
      disabled={loading || disabled}
    >
      <span className="ui-button__text">{children}</span>
      {loading && <span className="ui-button__skeleton" aria-hidden="true" />}
    </button>
  );
}
