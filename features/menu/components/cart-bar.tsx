"use client";

import { Icon } from "@/components/ui";
import { formatCurrency } from "../lib/pricing";

type CartBarProps = {
  itemCount: number;
  subtotal: number;
  onOpen: () => void;
};

export function CartBar({ itemCount, subtotal, onOpen }: CartBarProps) {
  if (itemCount === 0) return null;

  return (
    <div className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-30 px-margin pb-space-md">
      <button
        type="button"
        onClick={onOpen}
        className="pointer-events-auto mx-auto flex w-full max-w-2xl items-center justify-between gap-space-md rounded-full bg-primary px-space-lg py-space-sm text-on-primary shadow-level-3 transition-colors hover:bg-primary-hover"
      >
        <span className="flex items-center gap-space-sm">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <Icon name="shopping_bag" size="sm" />
            <span className="tabular absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-inverse-surface px-1 text-[11px] font-bold text-inverse-on-surface">
              {itemCount}
            </span>
          </span>
          <span className="font-label-lg">Ver pedido</span>
        </span>
        <span className="tabular font-display text-price-display">
          {formatCurrency(subtotal)}
        </span>
      </button>
    </div>
  );
}
