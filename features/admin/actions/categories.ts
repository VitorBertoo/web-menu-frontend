"use server";

import { revalidatePath } from "next/cache";
import { adminApi } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, fail, ok } from "../lib/action-result";
import { messageForError } from "../lib/errors";
import { categorySchema } from "../lib/schemas";

export async function createCategoryAction(input: {
  name: string;
  position: number;
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fail("Dados inválidos.");

  try {
    await adminApi.categories.create(parsed.data);
    revalidatePath("/admin/categories");
    return ok("Categoria criada.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function updateCategoryAction(
  id: string,
  input: { name: string; position: number },
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fail("Dados inválidos.");

  try {
    await adminApi.categories.update(id, parsed.data);
    revalidatePath("/admin/categories");
    return ok("Categoria atualizada.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await adminApi.categories.remove(id);
    revalidatePath("/admin/categories");
    return ok("Categoria removida.");
  } catch (error) {
    return fail(messageForError(error));
  }
}
