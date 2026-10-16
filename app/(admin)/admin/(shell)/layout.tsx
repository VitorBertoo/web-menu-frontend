import type { ReactNode } from "react";
import { Icon } from "@/components/ui";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { LogoutButton } from "@/features/admin/components/logout-button";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

export default async function AdminShellLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-dvh flex-1 bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-7xl">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest p-space-lg md:flex">
          <div className="mb-space-lg font-display text-headline-sm text-primary">
            web-menu
          </div>
          <AdminNav />
          <div className="mt-auto flex flex-col gap-space-xs border-t border-outline-variant pt-space-md">
            <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant">
              <Icon name="account_circle" size="sm" />
              <span className="truncate">{admin.name}</span>
            </div>
            <LogoutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-margin md:p-margin-desktop">
          <div className="mb-space-md flex items-center justify-between md:hidden">
            <span className="font-display text-headline-sm text-primary">web-menu</span>
            <LogoutButton />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
