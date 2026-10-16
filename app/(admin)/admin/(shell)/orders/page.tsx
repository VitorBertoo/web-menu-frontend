import { OrderBoard } from "@/features/admin/components/order-board";
import { isOrderStatus, isOrderType } from "@/features/admin/lib/order-flow";
import { adminApi } from "@/lib/api/admin";

export const instant = false;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = isOrderStatus(params.status) ? params.status : undefined;
  const type = isOrderType(params.type) ? params.type : undefined;
  const page = Number(params.page ?? "1") || 1;

  const data = await adminApi.orders.list({ status, type, page, pageSize: 20 });

  return <OrderBoard orders={data.items} />;
}
