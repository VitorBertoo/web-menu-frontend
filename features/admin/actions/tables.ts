"use server";

import { revalidatePath } from "next/cache";
import { adminApi } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, fail, ok } from "../lib/action-result";
import { messageForError } from "../lib/errors";
import { tableSchema } from "../lib/schemas";

export async function createTableAction(input: {
  label: string;
  isActive: boolean;
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = tableSchema.safeParse(input);
  if (!parsed.success) return fail("Dados inválidos.");

  try {
    await adminApi.tables.create(parsed.data);
    revalidatePath("/admin/tables");
    return ok("Mesa criada.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function updateTableAction(
  id: string,
  input: { label: string; isActive: boolean },
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = tableSchema.safeParse(input);
  if (!parsed.success) return fail("Dados inválidos.");

  try {
    await adminApi.tables.update(id, parsed.data);
    revalidatePath("/admin/tables");
    return ok("Mesa atualizada.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function regenerateTableTokenAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await adminApi.tables.regenerate(id);
    revalidatePath("/admin/tables");
    return ok("QR code regenerado.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function deleteTableAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await adminApi.tables.remove(id);
    revalidatePath("/admin/tables");
    return ok("Mesa removida.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function closeSessionAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await adminApi.sessions.close(id);
    revalidatePath("/admin/tables");
    revalidatePath("/admin/orders");
    return ok("Conta fechada.");
  } catch (error) {
    return fail(messageForError(error));
  }
}
