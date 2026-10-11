import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const chipVariants = cva(
  "inline-flex shrink-0 items-center gap-space-xs whitespace-nowrap rounded-full px-space-md py-2 text-label-md transition-colors",
  {
    variants: {
      variant: {
        inactive: "bg-surface-container text-on-surface hover:bg-surface-container-high",
        active: "bg-primary text-on-primary shadow-level-1",
        dark: "bg-inverse-surface text-inverse-on-surface shadow-level-1",
        outline:
          "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container",
      },
    },
    defaultVariants: {
      variant: "inactive",
    },
  },
);

export type ChipProps = ComponentProps<"button"> & VariantProps<typeof chipVariants>;

export function Chip({ className, variant, type = "button", ...props }: ChipProps) {
  return (
    <button type={type} className={cn(chipVariants({ variant }), className)} {...props} />
  );
}

export function ChipTrack({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-space-xs overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}
