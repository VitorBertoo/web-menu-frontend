"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge, Button, Dialog, Icon, Input, Textarea } from "@/components/ui";
import type { Category, Product } from "@/lib/types";
import {
  createProductAction,
  deleteProductAction,
  getProductAction,
  updateProductAction,
} from "../actions/products";
import { formatCurrency } from "../lib/format";
import { type ProductFormValues, productBaseSchema } from "../lib/schemas";

type ComponentDraft = {
  id: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
};

type GroupDraft = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  components: ComponentDraft[];
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

const EMPTY_DEFAULTS: ProductFormValues = {
  name: "",
  description: "",
  basePrice: 0,
  imageUrl: "",
  isAvailable: true,
  categoryIds: [],
};

function validateGroups(groups: GroupDraft[]): string | null {
  for (const group of groups) {
    if (!group.name.trim()) return "Todo grupo precisa de um nome.";
    if (group.components.length === 0)
      return `O grupo "${group.name}" precisa de ao menos um componente.`;
    if (group.maxSelect < group.minSelect)
      return `No grupo "${group.name}", o máximo deve ser maior ou igual ao mínimo.`;
    if (group.isRequired && group.minSelect < 1)
      return `O grupo "${group.name}" é obrigatório, então o mínimo deve ser 1.`;
    if (group.components.some((component) => !component.name.trim()))
      return "Todo componente precisa de um nome.";
  }
  return null;
}

export function ProductManager({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [groups, setGroups] = useState<GroupDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productBaseSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const resetForm = (values: ProductFormValues, nextGroups: GroupDraft[]) => {
    form.reset(values);
    setGroups(nextGroups);
    setError(null);
  };

  const openCreate = () => {
    setEditing(null);
    resetForm(EMPTY_DEFAULTS, []);
    setOpen(true);
  };

  const openEdit = async (product: Product) => {
    setEditing(product);
    setError(null);
    setLoading(true);
    setOpen(true);

    const detail = (await getProductAction(product.id)) ?? product;
    resetForm(
      {
        name: detail.name,
        description: detail.description ?? "",
        basePrice: detail.basePrice,
        imageUrl: detail.imageUrl ?? "",
        isAvailable: detail.isAvailable,
        categoryIds: detail.productCategories.map((link) => link.categoryId),
      },
      detail.componentGroups.map((group) => ({
        id: newId(),
        name: group.name,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        isRequired: group.isRequired,
        components: group.components.map((component) => ({
          id: newId(),
          name: component.name,
          priceDelta: component.priceDelta,
          isAvailable: component.isAvailable,
        })),
      })),
    );
    setLoading(false);
  };

  const addGroup = () => {
    setGroups((current) => [
      ...current,
      {
        id: newId(),
        name: "",
        minSelect: 0,
        maxSelect: 1,
        isRequired: false,
        components: [{ id: newId(), name: "", priceDelta: 0, isAvailable: true }],
      },
    ]);
  };

  const updateGroup = (groupIndex: number, patch: Partial<GroupDraft>) => {
    setGroups((current) =>
      current.map((group, index) =>
        index === groupIndex ? { ...group, ...patch } : group,
      ),
    );
  };

  const removeGroup = (groupIndex: number) => {
    setGroups((current) => current.filter((_, index) => index !== groupIndex));
  };

  const updateComponent = (
    groupIndex: number,
    componentIndex: number,
    patch: Partial<ComponentDraft>,
  ) => {
    setGroups((current) =>
      current.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              components: group.components.map((component, cIndex) =>
                cIndex === componentIndex ? { ...component, ...patch } : component,
              ),
            }
          : group,
      ),
    );
  };

  const addComponent = (groupIndex: number) => {
    setGroups((current) =>
      current.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              components: [
                ...group.components,
                { id: newId(), name: "", priceDelta: 0, isAvailable: true },
              ],
            }
          : group,
      ),
    );
  };

  const removeComponent = (groupIndex: number, componentIndex: number) => {
    setGroups((current) =>
      current.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              components: group.components.filter(
                (_, cIndex) => cIndex !== componentIndex,
              ),
            }
          : group,
      ),
    );
  };

  const onSubmit = async (values: ProductFormValues) => {
    setError(null);
    const groupError = validateGroups(groups);
    if (groupError) {
      setError(groupError);
      return;
    }

    const payload = { ...values, componentGroups: groups };
    const result = editing
      ? await updateProductAction(editing.id, payload)
      : await createProductAction(payload);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Remover o produto "${product.name}"?`)) return;
    const result = await deleteProductAction(product.id);
    if (!result.ok) setError(result.error);
    else router.refresh();
  };

  const toggleCategory = (categoryId: string, checked: boolean) => {
    const current = form.getValues("categoryIds");
    form.setValue(
      "categoryIds",
      checked ? [...current, categoryId] : current.filter((id) => id !== categoryId),
    );
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-lg text-on-surface">Produtos</h1>
        <Button onClick={openCreate}>
          <Icon name="add" />
          Novo produto
        </Button>
      </div>

      {error && !open ? <p className="text-label-sm text-error">{error}</p> : null}

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant p-space-xl text-center text-body-md text-on-surface-variant">
          Nenhum produto cadastrado.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-start justify-between gap-space-md rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-md shadow-level-1"
            >
              <div className="flex min-w-0 flex-col gap-space-2xs">
                <div className="flex items-center gap-space-sm">
                  <span className="font-display text-headline-sm text-on-surface">
                    {product.name}
                  </span>
                  <Badge variant={product.isAvailable ? "success" : "neutral"}>
                    {product.isAvailable ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
                {product.description ? (
                  <p className="line-clamp-1 text-body-sm text-on-surface-variant">
                    {product.description}
                  </p>
                ) : null}
                <div className="flex items-center gap-space-sm text-body-sm text-on-surface-variant">
                  <span className="tabular text-price-display text-primary">
                    {formatCurrency(product.basePrice)}
                  </span>
                  <span>{product.productCategories.length} categorias</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-space-xs">
                <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                  <Icon name="edit" size="sm" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(product)}>
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
        side="bottom"
        title={editing ? "Editar produto" : "Novo produto"}
        footer={
          <Button
            block
            size="lg"
            disabled={form.formState.isSubmitting || loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {form.formState.isSubmitting ? "Salvando..." : "Salvar produto"}
          </Button>
        }
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-space-lg"
        >
          <Input
            label="Nome"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Textarea
            label="Descrição"
            error={form.formState.errors.description?.message}
            {...form.register("description")}
          />
          <div className="grid grid-cols-2 gap-space-md">
            <Input
              label="Preço base (R$)"
              type="number"
              step="0.01"
              min={0}
              error={form.formState.errors.basePrice?.message}
              {...form.register("basePrice", { valueAsNumber: true })}
            />
            <Input
              label="URL da imagem"
              error={form.formState.errors.imageUrl?.message}
              {...form.register("imageUrl")}
            />
          </div>
          <label className="flex items-center gap-space-sm text-body-md text-on-surface">
            <input type="checkbox" {...form.register("isAvailable")} />
            Disponível para venda
          </label>

          <fieldset className="flex flex-col gap-space-sm">
            <legend className="text-label-sm uppercase tracking-wide text-on-surface-variant">
              Categorias
            </legend>
            {categories.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                Nenhuma categoria cadastrada.
              </p>
            ) : (
              <div className="flex flex-wrap gap-space-sm">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-space-xs rounded-full bg-surface-container-low px-space-sm py-space-xs text-body-sm text-on-surface"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={form.getValues("categoryIds").includes(category.id)}
                      onChange={(event) =>
                        toggleCategory(category.id, event.target.checked)
                      }
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <legend className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                Grupos de componentes
              </legend>
              <Button variant="secondary" size="sm" onClick={addGroup}>
                <Icon name="add" size="sm" />
                Grupo
              </Button>
            </div>

            {groups.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                Sem grupos de componentes (produto simples).
              </p>
            ) : null}

            {groups.map((group, groupIndex) => (
              <div
                key={group.id}
                className="flex flex-col gap-space-sm rounded-xl border border-outline-variant p-space-md"
              >
                <div className="flex items-center gap-space-sm">
                  <Input
                    aria-label="Nome do grupo"
                    placeholder="Nome do grupo"
                    value={group.name}
                    onChange={(event) =>
                      updateGroup(groupIndex, { name: event.target.value })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover grupo"
                    onClick={() => removeGroup(groupIndex)}
                  >
                    <Icon name="delete" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 items-end gap-space-sm">
                  <Input
                    label="Mín."
                    type="number"
                    min={0}
                    value={group.minSelect}
                    onChange={(event) =>
                      updateGroup(groupIndex, {
                        minSelect: Number(event.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    label="Máx."
                    type="number"
                    min={1}
                    value={group.maxSelect}
                    onChange={(event) =>
                      updateGroup(groupIndex, {
                        maxSelect: Number(event.target.value) || 1,
                      })
                    }
                  />
                  <label className="flex h-11 items-center gap-space-xs text-body-sm text-on-surface">
                    <input
                      type="checkbox"
                      checked={group.isRequired}
                      onChange={(event) =>
                        updateGroup(groupIndex, {
                          isRequired: event.target.checked,
                        })
                      }
                    />
                    Obrigatório
                  </label>
                </div>

                <div className="flex flex-col gap-space-xs">
                  {group.components.map((component, componentIndex) => (
                    <div key={component.id} className="flex items-end gap-space-sm">
                      <Input
                        aria-label="Nome do componente"
                        placeholder="Nome do componente"
                        value={component.name}
                        onChange={(event) =>
                          updateComponent(groupIndex, componentIndex, {
                            name: event.target.value,
                          })
                        }
                      />
                      <Input
                        aria-label="Acréscimo"
                        type="number"
                        step="0.01"
                        min={0}
                        className="w-28"
                        value={component.priceDelta}
                        onChange={(event) =>
                          updateComponent(groupIndex, componentIndex, {
                            priceDelta: Number(event.target.value) || 0,
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remover componente"
                        onClick={() => removeComponent(groupIndex, componentIndex)}
                      >
                        <Icon name="close" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addComponent(groupIndex)}
                  >
                    <Icon name="add" size="sm" />
                    Componente
                  </Button>
                </div>
              </div>
            ))}
          </fieldset>

          {error ? <p className="text-label-sm text-error">{error}</p> : null}
        </form>
      </Dialog>
    </div>
  );
}
