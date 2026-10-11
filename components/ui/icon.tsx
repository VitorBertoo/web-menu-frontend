import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

const iconVariants = cva("font-icon inline-block leading-none", {
  variants: {
    size: {
      sm: "text-[16px]",
      md: "text-[20px]",
      lg: "text-[24px]",
      xl: "text-[32px]",
    },
  },
  defaultVariants: { size: "md" },
});

export type IconProps = ComponentProps<"span"> &
  VariantProps<typeof iconVariants> & {
    name: string;
    filled?: boolean;
  };

export function Icon({ className, size, name, filled, style, ...props }: IconProps) {
  const fillStyle = filled
    ? ({ fontVariationSettings: "'FILL' 1" } as CSSProperties)
    : undefined;

  return (
    <span
      aria-hidden="true"
      className={cn(iconVariants({ size }), className)}
      style={{ ...fillStyle, ...style }}
      {...props}
    >
      {name}
    </span>
  );
}
