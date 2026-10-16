import type { OrderStatus, OrderType } from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "completed",
  "canceled",
];

const ORDER_TYPES: OrderType[] = ["dine_in", "pickup", "delivery"];

export function isOrderStatus(value: string | undefined): value is OrderStatus {
  return !!value && (ORDER_STATUSES as string[]).includes(value);
}

export function isOrderType(value: string | undefined): value is OrderType {
  return !!value && (ORDER_TYPES as string[]).includes(value);
}

export function nextStatuses(status: OrderStatus, type: OrderType): OrderStatus[] {
  switch (status) {
    case "pending":
      return ["confirmed", "canceled"];
    case "confirmed":
      return ["preparing", "canceled"];
    case "preparing":
      return ["ready", "canceled"];
    case "ready":
      return type === "delivery" ? ["out_for_delivery"] : ["completed"];
    case "out_for_delivery":
      return ["delivered"];
    case "delivered":
      return ["completed"];
    default:
      return [];
  }
}

export const ORDER_BADGE_VARIANT: Record<
  OrderStatus,
  "neutral" | "primary" | "success" | "warning" | "danger"
> = {
  pending: "warning",
  confirmed: "primary",
  preparing: "primary",
  ready: "success",
  out_for_delivery: "primary",
  delivered: "success",
  completed: "neutral",
  canceled: "danger",
};

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES;
export const ORDER_TYPE_OPTIONS = ORDER_TYPES;
