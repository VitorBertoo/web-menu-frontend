"use client";

import type { ComponentProps } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: string;
};

export function Input({
  className,
  label,
  hint,
  error,
  leftIcon,
  id,
  ...props
}: ComponentProps<"input"> & FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-space-2xs">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-label-sm uppercase tracking-wide text-on-surface-variant"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span className="font-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-outline">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 w-full rounded-md border border-outline bg-surface-container-lowest px-space-sm text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50",
            leftIcon && "pl-10",
            error && "border-error focus:border-error focus:ring-error/30",
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <span id={`${inputId}-error`} className="text-label-sm text-error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="text-label-sm text-on-surface-variant">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function Textarea({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: ComponentProps<"textarea"> & FieldProps) {
  const autoId = useId();
  const areaId = id ?? autoId;

  return (
    <div className="flex flex-col gap-space-2xs">
      {label ? (
        <label
          htmlFor={areaId}
          className="text-label-sm uppercase tracking-wide text-on-surface-variant"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={areaId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-24 w-full resize-y rounded-md border border-outline bg-surface-container-lowest px-space-sm py-space-sm text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50",
          error && "border-error focus:border-error focus:ring-error/30",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-label-sm text-error">{error}</span>
      ) : hint ? (
        <span className="text-label-sm text-on-surface-variant">{hint}</span>
      ) : null}
    </div>
  );
}
