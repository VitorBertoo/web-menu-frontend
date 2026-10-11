"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  Icon,
  Skeleton,
} from "@/components/ui";
import { getOrder } from "@/lib/api";
import type { OrderDetail, OrderStatus, OrderType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useOrderTracking } from "@/lib/ws";

type OrderTrackerProps = {
  orderId: string;
};

const FLOW: Record<OrderType, OrderStatus[]> = {
  delivery: [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
    "completed",
  ],
  pickup: ["pending", "confirmed", "preparing", "ready", "completed"],
  dine_in: ["pending", "confirmed", "preparing", "ready", "completed"],
};

const LABELS: Record<OrderStatus, string> = {
  pending: "Pedido recebido",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  ready: "Pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  completed: "Concluído",
  canceled: "Cancelado",
};

const ICONS: Record<OrderStatus, string> = {
  pending: "receipt_long",
  confirmed: "check_circle",
  preparing: "skillet",
  ready: "room_service",
  out_for_delivery: "delivery_dining",
  delivered: "home",
  completed: "task_alt",
  canceled: "cancel",
};

const TYPE_LABEL: Record<OrderType, string> = {
  dine_in: "Na mesa",
  pickup: "Retirada",
  delivery: "Entrega",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function format(value: number) {
  return currency.format(value);
}

export function OrderTracker({ orderId }: OrderTrackerProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { status: liveStatus, connected } = useOrderTracking(`order:${orderId}`);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getOrder(orderId)
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col gap-space-lg">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-space-md py-space-2xl text-center">
          <Icon name="search_off" size="xl" className="text-outline" />
          <p className="text-body-md text-on-surface-variant">
            Não encontramos este pedido.
          </p>
          <Button variant="secondary" onClick={load}>
            <Icon name="refresh" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = liveStatus ?? order.status;
  const flow = FLOW[order.type];
  const currentIndex = flow.indexOf(currentStatus);
  const canceled = currentStatus === "canceled";

  return (
    <div className="flex flex-col gap-space-lg">
      <Card>
        <CardContent className="flex flex-col gap-space-md">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                {TYPE_LABEL[order.type]}
              </p>
              <h1 className="font-display text-headline-md text-on-surface">
                {LABELS[currentStatus]}
              </h1>
              <p className="text-body-sm text-on-surface-variant">
                Pedido <span className="tabular">{order.id.slice(0, 8)}</span>
              </p>
            </div>
            <Badge variant={canceled ? "danger" : connected ? "success" : "neutral"}>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  canceled
                    ? "bg-error"
                    : connected
                      ? "animate-pulse bg-emerald-600"
                      : "bg-outline",
                )}
              />
              {canceled ? "Cancelado" : connected ? "Ao vivo" : "Reconectando"}
            </Badge>
          </div>

          {!canceled ? (
            <ol className="flex flex-col gap-space-sm">
              {flow.map((step, index) => {
                const done = index <= currentIndex;
                const active = index === currentIndex;
                return (
                  <li key={step} className="flex items-center gap-space-sm">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        done
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-outline",
                        active && "ring-4 ring-primary/20",
                      )}
                    >
                      <Icon name={ICONS[step]} size="sm" />
                    </span>
                    <span
                      className={cn(
                        "text-body-md",
                        done
                          ? "font-semibold text-on-surface"
                          : "text-on-surface-variant",
                      )}
                    >
                      {LABELS[step]}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-space-md">
          <h2 className="font-display text-headline-sm text-on-surface">Itens</h2>
          <ul className="flex flex-col divide-y divide-outline-variant/60">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-2 py-space-sm first:pt-0"
              >
                <div className="flex flex-col">
                  <span className="text-body-md text-on-surface">
                    {item.quantity}× {item.productId.slice(0, 8)}
                  </span>
                  {item.components.length > 0 ? (
                    <span className="text-body-sm text-on-surface-variant">
                      {item.components.length} adicional(is)
                    </span>
                  ) : null}
                  {item.notes ? (
                    <span className="text-body-sm italic text-on-surface-variant">
                      “{item.notes}”
                    </span>
                  ) : null}
                </div>
                <span className="tabular text-body-md text-on-surface">
                  {format(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-space-2xs border-t border-outline-variant/60 pt-space-sm">
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span className="tabular">{format(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 ? (
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>Taxa de entrega</span>
                <span className="tabular">{format(order.deliveryFee)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-on-surface">Total</span>
              <span className="tabular text-price-display text-primary">
                {format(order.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/menu"
        className={buttonVariants({ variant: "secondary", block: true })}
      >
        <Icon name="arrow_back" />
        Voltar ao início
      </Link>
    </div>
  );
}
