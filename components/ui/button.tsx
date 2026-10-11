import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-space-xs rounded-md font-label-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary shadow-level-1 hover:bg-primary-hover hover:shadow-level-2",
        secondary:
          "border border-outline bg-transparent text-on-surface hover:bg-primary-container hover:text-on-primary-container",
        ghost: "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        danger: "bg-error text-on-error hover:opacity-90",
        inverse: "bg-inverse-surface text-inverse-on-surface hover:opacity-90",
      },
      size: {
        sm: "h-9 px-space-sm text-label-md",
        md: "h-10 px-space-md",
        lg: "h-12 px-space-lg",
        icon: "h-10 w-10",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  block,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}
