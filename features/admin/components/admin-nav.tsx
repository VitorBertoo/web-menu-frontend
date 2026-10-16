"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/orders", label: "Pedidos", icon: "receipt_long" },
  { href: "/admin/products", label: "Produtos", icon: "fastfood" },
  { href: "/admin/categories", label: "Categorias", icon: "category" },
  { href: "/admin/tables", label: "Mesas", icon: "table_restaurant" },
  { href: "/admin/restaurant", label: "Restaurante", icon: "storefront" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-space-xs">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-space-sm rounded-md px-space-sm py-space-sm text-body-md transition-colors",
              active
                ? "bg-primary-container font-semibold text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            )}
          >
            <span className="font-icon text-xl">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
