"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Badge, Button, Icon } from "@/components/ui";
import type { Order } from "@/lib/types";
import { cancelOrderAction, updateOrderStatusAction } from "../actions/orders";
import {
  formatCurrency,
  formatDateTime,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  shortId,
} from "../lib/format";
import {
  nextStatuses,
  ORDER_BADGE_VARIANT,
  ORDER_STATUS_OPTIONS,
  ORDER_TYPE_OPTIONS,
} from "../lib/order-flow";

export function OrderBoard({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(interval);
  }, [router]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/orders?${params.toString()}`);
  };

  const advance = (order: Order, status: Order["status"]) => {
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

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <h1 className="font-display text-headline-lg text-on-surface">Pedidos</h1>
          <Badge variant="success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
            Auto
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <select
            value={searchParams.get("status") ?? ""}
            onChange={(event) => setFilter("status", event.target.value)}
            className="h-10 rounded-md border border-outline bg-surface-container-lowest px-space-sm text-body-md text-on-surface"
          >
            <option value="">Todos os status</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select
            value={searchParams.get("type") ?? ""}
            onChange={(event) => setFilter("type", event.target.value)}
            className="h-10 rounded-md border border-outline bg-surface-container-lowest px-space-sm text-body-md text-on-surface"
          >
            <option value="">Todos os canais</option>
            {ORDER_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {ORDER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={() => router.refresh()}>
            <Icon name="refresh" size="sm" />
            Atualizar
          </Button>
        </div>
      </div>

      {error ? <p className="text-label-sm text-error">{error}</p> : null}

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant p-space-xl text-center text-body-md text-on-surface-variant">
          Nenhum pedido encontrado.
        </p>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {orders.map((order) => {
            const transitions = nextStatuses(order.status, order.type);
            const primary = transitions.find((status) => status !== "canceled");
            const canCancel = transitions.includes("canceled");
            return (
              <li
                key={order.id}
                className="flex flex-col gap-space-sm rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-md shadow-level-1 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-col gap-space-2xs">
                  <div className="flex items-center gap-space-sm">
                    <span className="tabular font-display text-headline-sm text-on-surface">
                      #{shortId(order.id)}
                    </span>
                    <Badge variant={ORDER_BADGE_VARIANT[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    <Badge variant="neutral">{ORDER_TYPE_LABELS[order.type]}</Badge>
                  </div>
                  <span className="text-body-sm text-on-surface-variant">
                    {formatDateTime(order.createdAt)} •{" "}
                    <span className="tabular">{formatCurrency(order.total)}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-space-xs">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex h-9 items-center gap-space-xs rounded-md px-space-sm text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                  >
                    <Icon name="visibility" size="sm" />
                    Detalhes
                  </Link>
                  {canCancel ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => advance(order, "canceled")}
                    >
                      <Icon name="cancel" size="sm" />
                      Cancelar
                    </Button>
                  ) : null}
                  {primary ? (
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => advance(order, primary)}
                    >
                      <Icon name="arrow_forward" size="sm" />
                      {ORDER_STATUS_LABELS[primary]}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
