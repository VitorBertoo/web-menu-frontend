import { Icon } from "@/components/ui";
import { formatCurrency, ORDER_TYPE_LABELS } from "@/features/admin/lib/format";
import { adminApi } from "@/lib/api/admin";

export const instant = false;

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-space-md rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-md shadow-level-1">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-container text-primary">
        <Icon name={icon} />
      </span>
      <div className="flex flex-col">
        <span className="text-label-sm uppercase tracking-wide text-on-surface-variant">
          {label}
        </span>
        <span className="tabular font-display text-headline-sm text-on-surface">
          {value}
        </span>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [sales, catalog, operations] = await Promise.all([
    adminApi.dashboard.sales(),
    adminApi.dashboard.catalog({ limit: 5 }),
    adminApi.dashboard.operations(),
  ]);

  const maxDailyRevenue = Math.max(1, ...sales.daily.map((day) => day.revenue));

  return (
    <div className="flex flex-col gap-space-xl">
      <header>
        <h1 className="font-display text-headline-lg text-on-surface">Dashboard</h1>
        <p className="text-body-md text-on-surface-variant">
          Visão geral das vendas, preparo e ocupação.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pedidos"
          value={String(sales.summary.orders)}
          icon="receipt_long"
        />
        <StatCard
          label="Receita"
          value={formatCurrency(sales.summary.revenue)}
          icon="payments"
        />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(sales.summary.averageTicket)}
          icon="trending_up"
        />
        <StatCard
          label="Cancelados"
          value={String(sales.summary.canceled)}
          icon="cancel"
        />
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
        <section className="flex flex-col gap-space-md rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-lg shadow-level-1">
          <h2 className="font-display text-headline-sm text-on-surface">
            Vendas por canal
          </h2>
          {sales.summary.byType.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Sem dados.</p>
          ) : (
            <ul className="flex flex-col gap-space-sm">
              {sales.summary.byType.map((entry) => (
                <li
                  key={entry.type}
                  className="flex items-center justify-between border-b border-outline-variant/50 pb-space-xs last:border-0"
                >
                  <span className="text-body-md text-on-surface">
                    {ORDER_TYPE_LABELS[entry.type]}
                  </span>
                  <span className="flex items-center gap-space-md text-body-sm text-on-surface-variant">
                    <span>{entry.orders} pedidos</span>
                    <span className="tabular font-semibold text-on-surface">
                      {formatCurrency(entry.revenue)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-space-md rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-lg shadow-level-1">
          <h2 className="font-display text-headline-sm text-on-surface">Operação</h2>
          <div className="grid grid-cols-2 gap-space-md">
            <div className="rounded-lg bg-surface-container-low p-space-md">
              <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                Tempo médio de preparo
              </p>
              <p className="tabular font-display text-headline-sm text-on-surface">
                {operations.prepTime.averageMinutes.toFixed(1)} min
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {operations.prepTime.ordersMeasured} pedidos medidos
              </p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-space-md">
              <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                Ocupação
              </p>
              <p className="tabular font-display text-headline-sm text-on-surface">
                {operations.occupancy.openSessions} abertas
              </p>
              <p className="text-body-sm text-on-surface-variant">
                média {operations.occupancy.averageMinutes.toFixed(0)} min •{" "}
                {operations.occupancy.sessions} sessões
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
        <section className="flex flex-col gap-space-md rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-lg shadow-level-1">
          <h2 className="font-display text-headline-sm text-on-surface">
            Produtos mais vendidos
          </h2>
          {catalog.topProducts.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Sem dados.</p>
          ) : (
            <ul className="flex flex-col gap-space-sm">
              {catalog.topProducts.map((product) => (
                <li key={product.productId} className="flex items-center justify-between">
                  <span className="text-body-md text-on-surface">{product.name}</span>
                  <span className="flex items-center gap-space-md text-body-sm text-on-surface-variant">
                    <span>{product.quantity}×</span>
                    <span className="tabular font-semibold text-on-surface">
                      {formatCurrency(product.revenue)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-space-md rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-lg shadow-level-1">
          <h2 className="font-display text-headline-sm text-on-surface">
            Receita diária
          </h2>
          {sales.daily.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Sem dados.</p>
          ) : (
            <ul className="flex flex-col gap-space-sm">
              {sales.daily.map((day) => (
                <li key={day.date} className="flex items-center gap-space-sm">
                  <span className="w-20 shrink-0 text-body-sm text-on-surface-variant">
                    {day.date}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${(day.revenue / maxDailyRevenue) * 100}%` }}
                    />
                  </span>
                  <span className="tabular w-24 text-right text-body-sm text-on-surface">
                    {formatCurrency(day.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
