"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  CheckboxOption,
  Dialog,
  Icon,
  QuantityStepper,
  RadioGroup,
  RadioOption,
  Textarea,
} from "@/components/ui";
import type { ComponentGroup, Product } from "@/lib/types";
import { formatCurrency } from "../lib/pricing";
import type { NewCartLine } from "../stores/cart";

type ProductCustomizerProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAdd: (line: NewCartLine) => void;
};

const EMPTY: Record<string, boolean> = {};

export function ProductCustomizer({
  product,
  open,
  onClose,
  onAdd,
}: ProductCustomizerProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>(EMPTY);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(EMPTY);
      setQuantity(1);
      setNotes("");
    }
  }, [open]);

  const groups = product?.componentGroups ?? [];

  const countInGroup = (group: ComponentGroup) =>
    group.components.filter((component) => selected[component.id]).length;

  const groupValid = (group: ComponentGroup) => {
    const count = countInGroup(group);
    const min = group.isRequired ? Math.max(1, group.minSelect) : group.minSelect;
    return count >= min && count <= group.maxSelect;
  };

  const allValid = groups.every(groupValid);

  const toggleComponent = (group: ComponentGroup, componentId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[componentId]) {
        delete next[componentId];
      } else if (countInGroup(group) < group.maxSelect) {
        next[componentId] = true;
      }
      return next;
    });
  };

  const selectRadio = (group: ComponentGroup, componentId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const component of group.components) delete next[component.id];
      next[componentId] = true;
      return next;
    });
  };

  const selectedComponents = groups
    .flatMap((group) => group.components)
    .filter((component) => selected[component.id]);

  const unitPrice =
    (product?.basePrice ?? 0) +
    selectedComponents.reduce((sum, component) => sum + component.priceDelta, 0);

  const handleAdd = () => {
    if (!product || !allValid) return;
    onAdd({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      basePrice: product.basePrice,
      quantity,
      notes,
      components: selectedComponents.map((component) => ({
        componentId: component.id,
        name: component.name,
        priceDelta: component.priceDelta,
        quantity: 1,
      })),
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      side="bottom"
      title="Personalizar seu prato"
      description={product?.name}
      footer={
        <div className="flex items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <span className="text-label-sm uppercase tracking-wide text-on-surface-variant">
              Total
            </span>
            <span className="tabular text-price-display text-primary">
              {formatCurrency(unitPrice * quantity)}
            </span>
          </div>
          <Button size="lg" disabled={!allValid} onClick={handleAdd}>
            <Icon name="add_shopping_cart" />
            Adicionar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-space-lg">
        {product?.description ? (
          <p className="text-body-md text-on-surface-variant">{product.description}</p>
        ) : null}

        {groups.map((group, index) => {
          const single = group.maxSelect === 1;
          const valid = groupValid(group);
          return (
            <section key={group.id} className="flex flex-col gap-space-sm">
              <div className="flex items-start justify-between gap-space-sm">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-label-sm font-bold text-on-primary">
                      {index + 1}
                    </span>
                    <h3 className="font-display text-headline-sm text-on-surface">
                      {group.name}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-body-sm text-on-surface-variant">
                    {group.isRequired
                      ? `Escolha ${group.minSelect === group.maxSelect ? group.minSelect : `${group.minSelect} a ${group.maxSelect}`}`
                      : `Opcional • até ${group.maxSelect}`}
                  </p>
                </div>
                <Badge variant={group.isRequired ? "required" : "optional"}>
                  {group.isRequired ? "Obrigatório" : "Opcional"}
                </Badge>
              </div>

              {single ? (
                <RadioGroup>
                  {group.components.map((component) => (
                    <RadioOption
                      key={component.id}
                      name={group.id}
                      value={component.id}
                      checked={!!selected[component.id]}
                      onChange={() => selectRadio(group, component.id)}
                      label={component.name}
                      trailing={
                        component.priceDelta > 0 ? (
                          <span className="tabular text-label-lg text-on-surface-variant">
                            + {formatCurrency(component.priceDelta)}
                          </span>
                        ) : null
                      }
                    />
                  ))}
                </RadioGroup>
              ) : (
                <div className="grid gap-space-sm">
                  {group.components.map((component) => (
                    <CheckboxOption
                      key={component.id}
                      value={component.id}
                      checked={!!selected[component.id]}
                      disabled={
                        !selected[component.id] && countInGroup(group) >= group.maxSelect
                      }
                      onChange={() => toggleComponent(group, component.id)}
                      label={component.name}
                      priceDelta={
                        component.priceDelta > 0
                          ? `+ ${formatCurrency(component.priceDelta)}`
                          : null
                      }
                    />
                  ))}
                </div>
              )}

              {!valid ? (
                <p className="text-label-sm text-error">
                  {group.isRequired
                    ? `Selecione ao menos ${Math.max(1, group.minSelect)} opção.`
                    : `Selecione no máximo ${group.maxSelect} opções.`}
                </p>
              ) : null}
            </section>
          );
        })}

        <Textarea
          label="Observações"
          placeholder="Ex.: sem cebola, ponto da carne..."
          value={notes}
          maxLength={500}
          onChange={(event) => setNotes(event.target.value)}
        />

        <div className="flex items-center justify-between">
          <span className="text-label-lg text-on-surface">Quantidade</span>
          <QuantityStepper
            value={quantity}
            min={1}
            max={20}
            onIncrement={() => setQuantity((value) => Math.min(20, value + 1))}
            onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
          />
        </div>
      </div>
    </Dialog>
  );
}
