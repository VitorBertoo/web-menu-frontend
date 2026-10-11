import type {
  CreateOrderInput,
  OrderDetail,
  PublicMenu,
  ResolveSessionResponse,
} from "@/lib/types";
import { apiFetch } from "./client";

export function getPublicMenu(slug: string) {
  return apiFetch<PublicMenu>(`/menu/${encodeURIComponent(slug)}`);
}

export function resolveSession(qrToken: string) {
  return apiFetch<ResolveSessionResponse>("/sessions/resolve", {
    method: "POST",
    body: { qrToken },
  });
}

export function createOrder(input: CreateOrderInput) {
  return apiFetch<OrderDetail>("/orders", {
    method: "POST",
    body: input,
  });
}

export function getOrder(id: string) {
  return apiFetch<OrderDetail>(`/orders/${encodeURIComponent(id)}`);
}
