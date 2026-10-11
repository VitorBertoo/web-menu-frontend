import type { CartLine } from "../stores/cart";

export function lineUnitPrice(line: CartLine): number {
  const componentsTotal = line.components.reduce(
    (sum, component) => sum + component.priceDelta * component.quantity,
    0,
  );
  return line.basePrice + componentsTotal;
}

export function lineTotal(line: CartLine): number {
  return lineUnitPrice(line) * line.quantity;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}
