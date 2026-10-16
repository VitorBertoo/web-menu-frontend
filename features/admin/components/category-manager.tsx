"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge, Button, Dialog, Icon, Input } from "@/components/ui";
import type { Category } from "@/lib/types";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "../actions/categories";
import { type CategoryFormValues, categorySchema } from "../lib/schemas";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", position: 0 },
  });

  const openCreate = () => {
    setEditing(null);
    setError(null);
    form.reset({
      name: "",
      position: categories.length,
    });
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setError(null);
    form.reset({ name: category.name, position: category.position });
    setOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setError(null);
    const result = editing
      ? await updateCategoryAction(editing.id, values)
      : await createCategoryAction(values);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`Remover a categoria "${category.name}"?`)) return;
    const result = await deleteCategoryAction(category.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg text-on-surface">Categorias</h1>
        <Button onClick={openCreate}>
          <Icon name="add" />
          Nova categoria
        </Button>
      </div>

      {error ? <p className="text-label-sm text-error">{error}</p> : null}

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant p-space-xl text-center text-body-md text-on-surface-variant">
          Nenhuma categoria cadastrada.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant/60 rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-level-1">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-space-md p-space-md"
            >
              <div className="flex items-center gap-space-md">
                <Badge variant="neutral">{category.position}</Badge>
                <span className="font-display text-headline-sm text-on-surface">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                  <Icon name="edit" size="sm" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(category)}>
                  <Icon name="delete" size="sm" />
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar categoria" : "Nova categoria"}
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
            label="Nome"
            placeholder="Ex.: Entradas"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Input
            label="Posição"
            type="number"
            min={0}
            error={form.formState.errors.position?.message}
            {...form.register("position", { valueAsNumber: true })}
          />
        </form>
      </Dialog>
    </div>
  );
}
