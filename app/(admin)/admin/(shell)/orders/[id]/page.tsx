import Link from "next/link";
import { Badge, Card, CardContent, Icon } from "@/components/ui";
import { OrderActions } from "@/features/admin/components/order-actions";
import {
  formatCurrency,
  formatDateTime,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  shortId,
} from "@/features/admin/lib/format";
import { ORDER_BADGE_VARIANT } from "@/features/admin/lib/order-flow";
import { adminApi } from "@/lib/api/admin";

export const instant = false;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, products] = await Promise.all([
    adminApi.orders.get(id),
    adminApi.products.list(),
  ]);

  const nameById = new Map(products.map((product) => [product.id, product.name]));

  return (
    <div className="flex flex-col gap-space-lg">
      <Link
        href="/admin/orders"
        className="inline-flex w-fit items-center gap-space-xs text-body-sm text-on-surface-variant hover:text-on-surface"
      >
        <Icon name="arrow_back" size="sm" />
        Voltar aos pedidos
      </Link>

      <div className="flex flex-wrap items-center gap-space-sm">
        <h1 className="tabular font-display text-headline-lg text-on-surface">
          #{shortId(order.id)}
        </h1>
        <Badge variant={ORDER_BADGE_VARIANT[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
        <Badge variant="neutral">{ORDER_TYPE_LABELS[order.type]}</Badge>
        <span className="text-body-sm text-on-surface-variant">
          {formatDateTime(order.createdAt)}
        </span>
      </div>

      <OrderActions order={order} />

      <Card>
        <CardContent className="flex flex-col gap-space-md">
          <h2 className="font-display text-headline-sm text-on-surface">Itens</h2>
          <ul className="flex flex-col divide-y divide-outline-variant/60">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-space-md py-space-sm first:pt-0"
              >
                <div className="flex flex-col">
                  <span className="text-body-md text-on-surface">
                    {item.quantity}×{" "}
                    {nameById.get(item.productId) ?? shortId(item.productId)}
                  </span>
                  {item.components.length > 0 ? (
                    <span className="text-body-sm text-on-surface-variant">
                      {item.components
                        .map(
                          (component) =>
                            `${component.quantity}× ${shortId(component.componentId)}`,
                        )
                        .join(", ")}
                    </span>
                  ) : null}
                  {item.notes ? (
                    <span className="text-body-sm italic text-on-surface-variant">
                      “{item.notes}”
                    </span>
                  ) : null}
                </div>
                <span className="tabular text-body-md text-on-surface">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-space-2xs border-t border-outline-variant/60 pt-space-sm">
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span className="tabular">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 ? (
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>Taxa de entrega</span>
                <span className="tabular">{formatCurrency(order.deliveryFee)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-on-surface">Total</span>
              <span className="tabular text-price-display text-primary">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {order.notes ? (
            <p className="rounded-lg bg-surface-container-low p-space-sm text-body-sm text-on-surface-variant">
              Observações: {order.notes}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-space-md">
          <h2 className="font-display text-headline-sm text-on-surface">Histórico</h2>
          <ol className="flex flex-col gap-space-sm">
            {order.statusLogs.map((log) => (
              <li key={log.id} className="flex items-center gap-space-sm">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-body-md text-on-surface">
                  {ORDER_STATUS_LABELS[log.status]}
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  {formatDateTime(log.createdAt)}
                </span>
                {log.note ? (
                  <span className="text-body-sm italic text-on-surface-variant">
                    — {log.note}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
