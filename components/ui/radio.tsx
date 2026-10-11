import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export function RadioGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("grid gap-space-sm", className)} {...props} role="radiogroup" />
  );
}

type RadioOptionProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  trailing?: ReactNode;
};

export function RadioOption({
  className,
  label,
  description,
  badge,
  trailing,
  ...props
}: RadioOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-sm shadow-level-1 transition-colors hover:bg-surface-container has-checked:bg-surface-container-high has-checked:ring-1 has-checked:ring-primary",
        className,
      )}
    >
      <span className="flex items-center gap-space-sm">
        <input type="radio" className="peer sr-only" {...props} />
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-outline transition-colors after:h-2 after:w-2 after:rounded-full after:bg-on-primary after:opacity-0 after:transition-opacity peer-checked:border-primary peer-checked:bg-primary peer-checked:after:opacity-100" />
        <span className="flex flex-col">
          <span className="flex items-center gap-1.5">
            <span className="font-label-lg text-on-surface">{label}</span>
            {badge ? (
              <Badge variant="optional" size="sm">
                {badge}
              </Badge>
            ) : null}
          </span>
          {description ? (
            <span className="text-body-sm text-on-surface-variant">{description}</span>
          ) : null}
        </span>
      </span>
      {trailing}
    </label>
  );
}
