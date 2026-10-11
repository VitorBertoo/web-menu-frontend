import type { OrderStatus, OrderType } from "@/lib/types";

export type OrderStatusEvent = {
  event: "order.status";
  data: {
    orderId: string;
    restaurantId: string;
    type: OrderType;
    status: OrderStatus;
    tableSessionId: string | null;
    updatedAt: string;
  };
};

export type ServerMessage =
  | OrderStatusEvent
  | { event: "connected" }
  | { event: "subscribed"; channel: string }
  | { event: "unsubscribed"; channel: string }
  | { event: "pong" }
  | { event: "error"; message: string };

export type OrderChannel = `order:${string}` | `session:${string}`;
