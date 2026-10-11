import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CheckboxOptionProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  priceDelta?: ReactNode;
};

export function CheckboxOption({
  className,
  label,
  description,
  priceDelta,
  ...props
}: CheckboxOptionProps) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-sm shadow-level-1 transition-colors hover:bg-surface-container has-checked:bg-surface-container-high has-checked:ring-1 has-checked:ring-primary",
        className,
      )}
    >
      <span className="flex items-center gap-space-sm">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border border-outline text-on-primary transition-colors group-has-checked:border-primary group-has-checked:bg-primary">
          <span className="font-icon text-[16px] leading-none opacity-0 transition-opacity group-has-checked:opacity-100">
            check
          </span>
        </span>
        <span className="flex flex-col">
          <span className="font-label-lg text-on-surface">{label}</span>
          {description ? (
            <span className="text-body-sm text-on-surface-variant">{description}</span>
          ) : null}
        </span>
      </span>
      {priceDelta ? (
        <span className="tabular text-label-lg text-on-surface-variant">
          {priceDelta}
        </span>
      ) : null}
    </label>
  );
}
