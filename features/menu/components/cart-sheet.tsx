"use client";

import { Button, Dialog, Icon, QuantityStepper } from "@/components/ui";
import { formatCurrency, lineUnitPrice } from "../lib/pricing";
import type { CartLine } from "../stores/cart";

type CartSheetProps = {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  subtotal: number;
  onSetQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
};

export function CartSheet({
  open,
  onClose,
  lines,
  subtotal,
  onSetQuantity,
  onRemove,
  onCheckout,
}: CartSheetProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      side="bottom"
      title="Seu pedido"
      description={`${lines.length} ${lines.length === 1 ? "item" : "itens"}`}
      footer={
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="text-label-lg text-on-surface-variant">Subtotal</span>
            <span className="tabular text-price-display text-on-surface">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <Button size="lg" block disabled={lines.length === 0} onClick={onCheckout}>
            <Icon name="point_of_sale" />
            Finalizar pedido
          </Button>
        </div>
      }
    >
      {lines.length === 0 ? (
        <p className="py-space-lg text-center text-body-md text-on-surface-variant">
          Seu pedido está vazio.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant/60">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-space-sm py-space-md first:pt-0">
              <div className="flex min-w-0 flex-1 flex-col gap-space-2xs">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-headline-sm text-on-surface">
                    {line.name}
                  </h3>
                  <span className="tabular whitespace-nowrap text-label-lg text-on-surface">
                    {formatCurrency(lineUnitPrice(line) * line.quantity)}
                  </span>
                </div>
                {line.components.length > 0 ? (
                  <p className="text-body-sm text-on-surface-variant">
                    {line.components.map((component) => component.name).join(" • ")}
                  </p>
                ) : null}
                {line.notes ? (
                  <p className="text-body-sm italic text-on-surface-variant">
                    “{line.notes}”
                  </p>
                ) : null}
                <div className="mt-space-xs flex items-center justify-between">
                  <QuantityStepper
                    size="sm"
                    value={line.quantity}
                    min={1}
                    max={20}
                    onIncrement={() => onSetQuantity(line.id, line.quantity + 1)}
                    onDecrement={() => onSetQuantity(line.id, line.quantity - 1)}
                  />
                  <Button variant="ghost" size="sm" onClick={() => onRemove(line.id)}>
                    <Icon name="delete" size="sm" />
                    Remover
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
