import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-space-2xs rounded-full uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-surface-container-high text-on-surface",
        primary: "bg-primary text-on-primary",
        required: "bg-inverse-surface text-inverse-on-surface",
        optional:
          "border border-primary/20 bg-primary-container text-on-primary-container",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-amber-100 text-amber-900",
        danger: "bg-error-container text-on-error-container",
      },
      size: {
        sm: "px-2 py-0.5 text-label-sm",
        md: "px-2.5 py-1 text-label-sm",
        lg: "px-3 py-1 text-label-md",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
