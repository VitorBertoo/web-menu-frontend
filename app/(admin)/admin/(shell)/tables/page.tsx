import { TableManager } from "@/features/admin/components/table-manager";
import { adminApi } from "@/lib/api/admin";

export const instant = false;

export default async function AdminTablesPage() {
  const [tables, openSessions, restaurant] = await Promise.all([
    adminApi.tables.list(),
    adminApi.sessions.open(),
    adminApi.restaurant.get(),
  ]);

  const menuHost = process.env.NEXT_PUBLIC_MENU_HOST ?? "menu.localhost";
  const menuBaseUrl = menuHost.includes("localhost") ? "" : `https://${menuHost}`;

  return (
    <TableManager
      tables={tables}
      openSessions={openSessions}
      slug={restaurant.slug}
      menuBaseUrl={menuBaseUrl}
    />
  );
}
