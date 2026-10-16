"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge, Button, Dialog, Icon, Input } from "@/components/ui";
import type { Table, TableSession } from "@/lib/types";
import {
  closeSessionAction,
  createTableAction,
  deleteTableAction,
  regenerateTableTokenAction,
  updateTableAction,
} from "../actions/tables";
import { formatDateTime } from "../lib/format";
import { type TableFormValues, tableSchema } from "../lib/schemas";

type TableManagerProps = {
  tables: Table[];
  openSessions: TableSession[];
  slug: string;
  menuBaseUrl: string;
};

export function TableManager({
  tables,
  openSessions,
  slug,
  menuBaseUrl,
}: TableManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: { label: "", isActive: true },
  });

  const openCreate = () => {
    setEditing(null);
    setError(null);
    form.reset({ label: "", isActive: true });
    setOpen(true);
  };

  const openEdit = (table: Table) => {
    setEditing(table);
    setError(null);
    form.reset({ label: table.label, isActive: table.isActive });
    setOpen(true);
  };

  const run = async (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    const result = await action();
    if (!result.ok) {
      setError(result.error ?? "Erro inesperado.");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  const onSubmit = (values: TableFormValues) =>
    run(() =>
      editing ? updateTableAction(editing.id, values) : createTableAction(values),
    );

  const regenerate = (table: Table) => {
    if (
      !window.confirm(
        `Regenerar o QR da "${table.label}"? Os QR antigos serão invalidados.`,
      )
    )
      return;
    void run(() => regenerateTableTokenAction(table.id));
  };

  const remove = (table: Table) => {
    if (!window.confirm(`Remover a mesa "${table.label}"?`)) return;
    void run(() => deleteTableAction(table.id));
  };

  const linkFor = (table: Table) =>
    `${menuBaseUrl}/menu/${slug}?table=${encodeURIComponent(table.qrToken)}`;

  return (
    <div className="flex flex-col gap-space-xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg text-on-surface">Mesas</h1>
        <Button onClick={openCreate}>
          <Icon name="add" />
          Nova mesa
        </Button>
      </div>

      {error ? <p className="text-label-sm text-error">{error}</p> : null}

      <section className="flex flex-col gap-space-md">
        <h2 className="font-display text-headline-sm text-on-surface">
          Mesas ({tables.length})
        </h2>
        {tables.length === 0 ? (
          <p className="rounded-xl border border-dashed border-outline-variant p-space-xl text-center text-body-md text-on-surface-variant">
            Nenhuma mesa cadastrada.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-space-md md:grid-cols-2">
            {tables.map((table) => (
              <li
                key={table.id}
                className="flex flex-col gap-space-sm rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-md shadow-level-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-icon text-xl text-primary">
                      table_restaurant
                    </span>
                    <span className="font-display text-headline-sm text-on-surface">
                      {table.label}
                    </span>
                  </div>
                  <Badge variant={table.isActive ? "success" : "neutral"}>
                    {table.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>

                <p className="truncate rounded-md bg-surface-container-low px-space-sm py-space-2xs text-body-sm text-on-surface-variant">
                  {linkFor(table)}
                </p>

                <div className="flex flex-wrap items-center gap-space-xs">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(table)}>
                    <Icon name="edit" size="sm" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => regenerate(table)}>
                    <Icon name="qr_code_2" size="sm" />
                    Regenerar QR
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(table)}>
                    <Icon name="delete" size="sm" />
                    Remover
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-space-md">
        <h2 className="font-display text-headline-sm text-on-surface">
          Sessões abertas ({openSessions.length})
        </h2>
        {openSessions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-outline-variant p-space-xl text-center text-body-md text-on-surface-variant">
            Nenhuma sessão aberta.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant/60 rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-level-1">
            {openSessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between p-space-md"
              >
                <div className="flex flex-col">
                  <span className="font-display text-headline-sm text-on-surface">
                    {session.table?.label ?? "Mesa"}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    Aberta em {formatDateTime(session.openedAt)}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => run(() => closeSessionAction(session.id))}
                >
                  <Icon name="point_of_sale" size="sm" />
                  Fechar conta
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar mesa" : "Nova mesa"}
        footer={
          <Button
            block
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        }
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-space-md"
        >
          <Input
            label="Rótulo"
            placeholder="Ex.: Mesa 1"
            error={form.formState.errors.label?.message}
            {...form.register("label")}
          />
          <label className="flex items-center gap-space-sm text-body-md text-on-surface">
            <input type="checkbox" {...form.register("isActive")} />
            Mesa ativa
          </label>
        </form>
      </Dialog>
    </div>
  );
}
