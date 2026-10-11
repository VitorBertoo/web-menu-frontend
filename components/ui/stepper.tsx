"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const stepperVariants = cva(
  "inline-flex items-center rounded-full bg-surface-container-high shadow-level-1",
  {
    variants: {
      size: {
        sm: "h-8 text-label-md",
        md: "h-10 text-label-lg",
        lg: "h-12 text-label-lg",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const stepperButton = cva(
  "flex items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-40 disabled:hover:bg-transparent",
  {
    variants: {
      size: {
        sm: "h-7 w-7",
        md: "h-9 w-9",
        lg: "h-11 w-11",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type QuantityStepperProps = VariantProps<typeof stepperVariants> &
  Omit<ComponentProps<"fieldset">, "onChange"> & {
    value: number;
    min?: number;
    max?: number;
    onIncrement: () => void;
    onDecrement: () => void;
    label?: string;
  };

export function QuantityStepper({
  className,
  size,
  value,
  min = 0,
  max,
  onIncrement,
  onDecrement,
  label = "Quantidade",
  ...props
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <fieldset
      className={cn(stepperVariants({ size }), "m-0 border-0 p-0", className)}
      aria-label={label}
      {...props}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={atMin}
        aria-label="Diminuir"
        className={stepperButton({ size })}
      >
        <span className="font-icon text-[18px]">remove</span>
      </button>
      <span className="tabular min-w-7 text-center font-semibold text-on-surface">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={atMax}
        aria-label="Aumentar"
        className={stepperButton({ size })}
      >
        <span className="font-icon text-[18px]">add</span>
      </button>
    </fieldset>
  );
}
