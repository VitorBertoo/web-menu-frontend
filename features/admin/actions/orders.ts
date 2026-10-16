"use server";

import { revalidatePath } from "next/cache";
import { adminApi } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth";
import type { OrderStatus } from "@/lib/types";
import { type ActionResult, fail, ok } from "../lib/action-result";
import { messageForError } from "../lib/errors";

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus,
  note?: string,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await adminApi.orders.updateStatus(id, status, note ?? null);
    revalidatePath("/admin/orders");
    return ok("Status atualizado.");
  } catch (error) {
    return fail(messageForError(error));
  }
}

export async function cancelOrderAction(
  id: string,
  note?: string,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await adminApi.orders.cancel(id, note ?? null);
    revalidatePath("/admin/orders");
    return ok("Pedido cancelado.");
  } catch (error) {
    return fail(messageForError(error));
  }
}
