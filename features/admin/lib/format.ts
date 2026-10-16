import type { OrderStatus, OrderType } from "@/lib/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Recebido",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  ready: "Pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  completed: "Concluído",
  canceled: "Cancelado",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  dine_in: "Na mesa",
  pickup: "Retirada",
  delivery: "Entrega",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}
