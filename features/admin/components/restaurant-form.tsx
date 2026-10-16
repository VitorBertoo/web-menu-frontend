"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge, Button, Icon, Input } from "@/components/ui";
import type { Restaurant } from "@/lib/types";
import { updateRestaurantAction } from "../actions/restaurant";
import { type RestaurantFormValues, restaurantSchema } from "../lib/schemas";

export function RestaurantForm({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    message: string;
  } | null>(null);

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant.name,
      phone: restaurant.phone ?? "",
      isOpen: restaurant.isOpen,
      deliveryFee: restaurant.deliveryFee,
    },
  });

  const onSubmit = async (values: RestaurantFormValues) => {
    setFeedback(null);
    const result = await updateRestaurantAction(values);
    if (!result.ok) {
      setFeedback({ type: "error", message: result.error });
      return;
    }
    setFeedback({ type: "ok", message: result.message ?? "Salvo." });
    router.refresh();
  };

  return (
    <div className="flex max-w-xl flex-col gap-space-lg">
      <div>
        <h1 className="font-display text-headline-lg text-on-surface">Restaurante</h1>
        <p className="text-body-md text-on-surface-variant">
          Dados públicos do cardápio e regras de operação.
        </p>
      </div>

      <div className="flex items-center gap-space-sm rounded-lg bg-surface-container-low p-space-sm">
        <span className="text-label-sm uppercase tracking-wide text-on-surface-variant">
          Slug
        </span>
        <span className="font-mono text-body-sm text-on-surface">{restaurant.slug}</span>
        <Badge variant={restaurant.isOpen ? "success" : "neutral"}>
          {restaurant.isOpen ? "Aberto" : "Fechado"}
        </Badge>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-space-md rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-space-lg shadow-level-1"
      >
        <Input
          label="Nome"
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Input
          label="Telefone"
          placeholder="+55 11 99999-0000"
          error={form.formState.errors.phone?.message}
          {...form.register("phone")}
        />
        <Input
          label="Taxa de entrega (R$)"
          type="number"
          step="0.01"
          min={0}
          error={form.formState.errors.deliveryFee?.message}
          {...form.register("deliveryFee", { valueAsNumber: true })}
        />

        <label className="flex items-center justify-between gap-space-sm">
          <span className="text-label-lg text-on-surface">Aceitando pedidos</span>
          <input type="checkbox" {...form.register("isOpen")} />
        </label>

        {feedback ? (
          <p
            className={
              feedback.type === "ok"
                ? "text-label-sm text-emerald-600"
                : "text-label-sm text-error"
            }
          >
            {feedback.message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <Icon name="save" />
            {form.formState.isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
