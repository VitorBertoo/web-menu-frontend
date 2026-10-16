import { redirect } from "next/navigation";
import { ApiError, type ApiFetchOptions, apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/auth/session";
import type {
  AdminUser,
  CatalogReport,
  Category,
  CategoryInput,
  OperationsReport,
  OrderDetail,
  OrderListQuery,
  OrderStatus,
  Paginated,
  Product,
  ProductInput,
  Restaurant,
  SalesReport,
  Table,
  TableInput,
  TableSession,
  UpdateRestaurantInput,
} from "@/lib/types";

export async function adminFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const token = await getAdminToken();
  if (!token) {
    redirect("/admin/login");
  }

  try {
    return await apiFetch<T>(path, { ...options, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

function withQuery(path: string, query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const adminApi = {
  me: () => adminFetch<AdminUser>("/admin/auth/me"),

  restaurant: {
    get: () => adminFetch<Restaurant>("/admin/restaurant"),
    update: (input: UpdateRestaurantInput) =>
      adminFetch<Restaurant>("/admin/restaurant", { method: "PATCH", body: input }),
  },

  categories: {
    list: () => adminFetch<Category[]>("/admin/categories"),
    create: (input: CategoryInput) =>
      adminFetch<Category>("/admin/categories", { method: "POST", body: input }),
    update: (id: string, input: CategoryInput) =>
      adminFetch<Category>(`/admin/categories/${id}`, { method: "PATCH", body: input }),
    remove: (id: string) =>
      adminFetch<void>(`/admin/categories/${id}`, { method: "DELETE" }),
  },

  products: {
    list: () => adminFetch<Product[]>("/admin/products"),
    get: (id: string) => adminFetch<Product>(`/admin/products/${id}`),
    create: (input: ProductInput) =>
      adminFetch<Product>("/admin/products", { method: "POST", body: input }),
    update: (id: string, input: ProductInput) =>
      adminFetch<Product>(`/admin/products/${id}`, { method: "PATCH", body: input }),
    remove: (id: string) =>
      adminFetch<void>(`/admin/products/${id}`, { method: "DELETE" }),
  },

  tables: {
    list: () => adminFetch<Table[]>("/admin/tables"),
    create: (input: TableInput) =>
      adminFetch<Table>("/admin/tables", { method: "POST", body: input }),
    update: (id: string, input: TableInput) =>
      adminFetch<Table>(`/admin/tables/${id}`, { method: "PATCH", body: input }),
    regenerate: (id: string) =>
      adminFetch<Table>(`/admin/tables/${id}/regenerate-token`, { method: "POST" }),
    remove: (id: string) => adminFetch<void>(`/admin/tables/${id}`, { method: "DELETE" }),
  },

  sessions: {
    open: () => adminFetch<TableSession[]>("/admin/sessions/open"),
    close: (id: string) =>
      adminFetch<TableSession>(`/admin/sessions/${id}/close`, { method: "POST" }),
  },

  orders: {
    list: (query: OrderListQuery = {}) =>
      adminFetch<Paginated<OrderDetail>>(
        withQuery("/admin/orders", query as Record<string, unknown>),
      ),
    get: (id: string) => adminFetch<OrderDetail>(`/admin/orders/${id}`),
    updateStatus: (id: string, status: OrderStatus, note?: string | null) =>
      adminFetch<OrderDetail>(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: { status, note: note ?? null },
      }),
    cancel: (id: string, note?: string | null) =>
      adminFetch<OrderDetail>(`/admin/orders/${id}/cancel`, {
        method: "POST",
        body: { note: note ?? null },
      }),
  },

  dashboard: {
    sales: (query: { from?: string; to?: string } = {}) =>
      adminFetch<SalesReport>(withQuery("/admin/dashboard/sales", query)),
    catalog: (query: { from?: string; to?: string; limit?: number } = {}) =>
      adminFetch<CatalogReport>(withQuery("/admin/dashboard/catalog", query)),
    operations: (query: { from?: string; to?: string } = {}) =>
      adminFetch<OperationsReport>(withQuery("/admin/dashboard/operations", query)),
  },
};
