"use server";

import { revalidatePath } from "next/cache";
import { adminApi } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth";
import type { Product, ProductInput } from "@/lib/types";
import { type ActionResult, fail, ok } from "../lib/action-result";
import { messageForError } from "../lib/errors";
import { productInputSchema } from "../lib/schemas";

export async function getProductAction(id: string): Promise<Product | null> {
  await requireAdmin();
  try {
    return await adminApi.products.get(id);
  } catch {
    return null;
  }
}

function toInput(values: unknown): ProductInput | null {
  const parsed = productInputSchema.safeParse(values);
  if (!parsed.success) return null;

  const data = parsed.data;
  return {
    name: data.name,
    description: data.description ? data.description : null,
    basePrice: data.basePrice,
    imageUrl: data.imageUrl ? data.imageUrl : null,
    isAvailable: data.isAvailable,
    categoryIds: data.categoryIds,
    componentGroups: data.componentGroups.map((group, groupIndex) => ({
      name: group.name,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      isRequired: group.isRequired,
      position: groupIndex,
      components: group.components.map((component, componentIndex) => ({
        name: component.name,
        priceDelta: component.priceDelta,
        isAvailable: component.isAvailable,
        position: componentIndex,
      })),
    })),
  };
}

export async function createProductAction(values: unknown): Promise<ActionResult> {
  await requireAdmin();
  const input = toInput(values);
  if (!input) return fail("Revise os campos do produto e dos grupos.");

  try {
    await adminApi.products.create(input);
    revalidatePath("/admin/products");
    return ok("Produto criado.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function updateProductAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const input = toInput(values);
  if (!input) return fail("Revise os campos do produto e dos grupos.");

  try {
    await adminApi.products.update(id, input);
    revalidatePath("/admin/products");
    return ok("Produto atualizado.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await adminApi.products.remove(id);
    revalidatePath("/admin/products");
    return ok("Produto removido.");
  } catch (error) {
    return fail(messageForError(error));
  }
}
