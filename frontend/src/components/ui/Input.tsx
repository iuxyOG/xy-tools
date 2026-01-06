"use client";

import React, { useId } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, id, className, ...props }: InputProps) {
  const inputId = id ?? useId();
  const classes = ["input", "ui-input", className].filter(Boolean).join(" ");

  return (
    <div className="ui-field">
      {label ? (
        <label className="ui-label muted2" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={classes} {...props} />
      {hint ? (
        <div className="ui-hint muted2">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
