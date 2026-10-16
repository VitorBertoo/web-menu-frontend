"use server";

import { revalidatePath } from "next/cache";
import { adminApi } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth";
import { type ActionResult, fail, ok } from "../lib/action-result";
import { messageForError } from "../lib/errors";
import { restaurantSchema } from "../lib/schemas";

export async function updateRestaurantAction(input: {
  name: string;
  phone?: string;
  isOpen: boolean;
  deliveryFee: number;
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = restaurantSchema.safeParse(input);
  if (!parsed.success) return fail("Revise os dados do restaurante.");

  try {
    await adminApi.restaurant.update({
      name: parsed.data.name,
      phone: parsed.data.phone ? parsed.data.phone : null,
      isOpen: parsed.data.isOpen,
      deliveryFee: parsed.data.deliveryFee,
    });
    revalidatePath("/admin/restaurant");
    revalidatePath("/menu");
    return ok("Restaurante atualizado.");
  } catch (error) {
    return fail(messageForError(error));
  }
}
