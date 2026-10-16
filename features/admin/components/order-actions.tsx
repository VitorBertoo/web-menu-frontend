"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import type { OrderDetail, OrderStatus } from "@/lib/types";
import { cancelOrderAction, updateOrderStatusAction } from "../actions/orders";
import { ORDER_STATUS_LABELS } from "../lib/format";
import { nextStatuses } from "../lib/order-flow";

export function OrderActions({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const transitions = nextStatuses(order.status, order.type);

  const run = (status: OrderStatus) => {
    setError(null);
    startTransition(async () => {
      const result =
        status === "canceled"
          ? await cancelOrderAction(order.id)
          : await updateOrderStatusAction(order.id, status);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (transitions.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant">
        Nenhuma ação disponível para este pedido.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-wrap items-center gap-space-sm">
        {transitions
          .filter((status) => status !== "canceled")
          .map((status) => (
            <Button key={status} disabled={pending} onClick={() => run(status)}>
              <Icon name="arrow_forward" size="sm" />
              Marcar como {ORDER_STATUS_LABELS[status]}
            </Button>
          ))}
        {transitions.includes("canceled") ? (
          <Button variant="danger" disabled={pending} onClick={() => run("canceled")}>
            <Icon name="cancel" size="sm" />
            Cancelar pedido
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-label-sm text-error">{error}</p> : null}
    </div>
  );
}
