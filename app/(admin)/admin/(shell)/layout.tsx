import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/orders", label: "Pedidos", icon: "receipt_long" },
  { href: "/admin/products", label: "Produtos", icon: "fastfood" },
  { href: "/admin/categories", label: "Categorias", icon: "category" },
  { href: "/admin/tables", label: "Mesas", icon: "table_restaurant" },
];

export default function AdminShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex-1 bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-outline-variant bg-surface-container-lowest p-space-lg md:flex md:flex-col">
          <div className="mb-space-xl font-display text-headline-sm text-primary">
            web-menu
          </div>
          <nav className="flex flex-1 flex-col gap-space-xs">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-space-sm rounded-md px-space-sm py-space-sm text-body-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <span className="font-icon text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-margin md:p-margin-desktop">{children}</main>
      </div>
    </div>
  );
}
