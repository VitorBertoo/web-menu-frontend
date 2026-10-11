"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

type DialogSide = "center" | "bottom" | "right";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  side?: DialogSide;
  className?: string;
};

const sideClasses: Record<DialogSide, string> = {
  center: "m-auto w-[calc(100vw-2rem)] max-w-lg rounded-2xl",
  bottom:
    "mx-auto mb-0 mt-auto w-full max-w-none rounded-t-2xl sm:mb-auto sm:max-w-lg sm:rounded-2xl",
  right:
    "ml-auto mr-0 my-0 h-full max-h-none w-full max-w-md rounded-none sm:rounded-l-2xl",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "center",
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
    } else if (!open && element.open) {
      element.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "p-0 text-on-surface backdrop:bg-inverse-surface/60 backdrop:backdrop-blur-sm",
        sideClasses[side],
        className,
      )}
    >
      <div
        className={cn(
          "relative flex max-h-[90vh] flex-col overflow-hidden bg-surface-container-lowest shadow-level-3",
          side === "right" && "h-full max-h-none",
        )}
      >
        <div className="flex items-center justify-between gap-space-sm border-b border-outline-variant/60 px-space-lg py-space-md">
          <div className="flex flex-col">
            {side === "bottom" ? (
              <span className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-surface-dim" />
            ) : null}
            {title ? (
              <h2 className="font-display text-headline-sm text-on-surface">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-body-sm text-on-surface-variant">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-space-lg py-space-md">{children}</div>
        {footer ? (
          <div className="border-t border-outline-variant/60 bg-surface-container-lowest px-space-lg py-space-md">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
