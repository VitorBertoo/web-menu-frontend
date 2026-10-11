import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-level-1",
        className,
      )}
      {...props}
    />
  );
}

export function CardMedia({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-surface-container",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-space-md", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn("font-display text-headline-sm text-on-surface", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-body-sm text-on-surface-variant", className)} {...props} />
  );
}

export function CardPrice({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("tabular text-price-display text-primary", className)}
      {...props}
    />
  );
}
