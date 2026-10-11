"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Dialog, Icon, Input, Textarea } from "@/components/ui";
import { ApiError, createOrder } from "@/lib/api";
import type { CreateOrderInput, OrderItemInput } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../lib/pricing";
import { rememberOrder } from "../lib/recent-order";
import {
  type DeliveryFormValues,
  deliverySchema,
  type PickupFormValues,
  pickupSchema,
} from "../lib/schemas";
import type { CartLine } from "../stores/cart";

type Channel = "dine_in" | "pickup" | "delivery";

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  deliveryFee: number;
  lines: CartLine[];
  sessionId: string | null;
  tableLabel: string | null;
  onSuccess: (orderId: string) => void;
  onClearCart: () => void;
};

const channelLabels: Record<Channel, { label: string; icon: string }> = {
  dine_in: { label: "Na mesa", icon: "table_restaurant" },
  pickup: { label: "Retirada", icon: "shopping_bag" },
  delivery: { label: "Entrega", icon: "delivery_dining" },
};

function messageForError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "restaurant_closed":
        return "O restaurante está fechado no momento.";
      case "outside_opening_hours":
        return "Fora do horário de funcionamento.";
      case "invalid_table_session":
        return "Sessão da mesa expirada. Escaneie o QR code novamente.";
      case "rate_limited":
        return "Muitas tentativas. Aguarde alguns instantes e tente de novo.";
      case "empty_order":
        return "Adicione itens ao pedido.";
      default:
        return error.message;
    }
  }
  return "Não foi possível enviar o pedido. Tente novamente.";
}

export function CheckoutDialog({
  open,
  onClose,
  slug,
  deliveryFee,
  lines,
  sessionId,
  tableLabel,
  onSuccess,
  onClearCart,
}: CheckoutDialogProps) {
  const [channel, setChannel] = useState<Channel>(sessionId ? "dine_in" : "pickup");
  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickupForm = useForm<PickupFormValues>({
    resolver: zodResolver(pickupSchema),
    defaultValues: { customerName: "", customerPhone: "" },
  });

  const deliveryForm = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipcode: "",
      reference: "",
    },
  });

  const subtotal = lines.reduce((sum, line) => {
    const components = line.components.reduce(
      (acc, component) => acc + component.priceDelta * component.quantity,
      0,
    );
    return sum + (line.basePrice + components) * line.quantity;
  }, 0);
  const total = subtotal + (channel === "delivery" ? deliveryFee : 0);

  const placeOrder = async (values?: PickupFormValues | DeliveryFormValues) => {
    setError(null);
    setSubmitting(true);

    const items: OrderItemInput[] = lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      notes: line.notes ? line.notes : null,
      components: line.components.map((component) => ({
        componentId: component.componentId,
        quantity: component.quantity,
      })),
    }));

    let input: CreateOrderInput;
    if (channel === "dine_in") {
      if (!sessionId) {
        setError("Mesa não identificada. Escaneie o QR code novamente.");
        setSubmitting(false);
        return;
      }
      input = {
        type: "dine_in",
        slug,
        tableSessionId: sessionId,
        notes: orderNotes || null,
        items,
      };
    } else if (channel === "pickup") {
      const pickup = values as PickupFormValues;
      input = {
        type: "pickup",
        slug,
        customerName: pickup.customerName,
        customerPhone: pickup.customerPhone,
        notes: orderNotes || null,
        items,
      };
    } else {
      const delivery = values as DeliveryFormValues;
      input = {
        type: "delivery",
        slug,
        customerName: delivery.customerName,
        customerPhone: delivery.customerPhone,
        notes: orderNotes || null,
        deliveryAddress: {
          street: delivery.street,
          number: delivery.number,
          complement: delivery.complement || undefined,
          neighborhood: delivery.neighborhood,
          city: delivery.city,
          state: delivery.state,
          zipcode: delivery.zipcode,
          reference: delivery.reference || undefined,
        },
        items,
      };
    }

    try {
      const order = await createOrder(input);
      onClearCart();
      rememberOrder(order.id);
      onSuccess(order.id);
    } catch (submitError) {
      setError(messageForError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (channel === "dine_in") {
      void placeOrder();
    } else if (channel === "delivery") {
      void deliveryForm.handleSubmit((values) => placeOrder(values))();
    } else {
      void pickupForm.handleSubmit((values) => placeOrder(values))();
    }
  };

  const errors =
    channel === "delivery" ? deliveryForm.formState.errors : pickupForm.formState.errors;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      side="bottom"
      title="Finalizar pedido"
      description="Escolha como deseja receber seu pedido."
      footer={
        <div className="flex flex-col gap-space-sm">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span className="tabular">{formatCurrency(subtotal)}</span>
            </div>
            {channel === "delivery" && deliveryFee > 0 ? (
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>Taxa de entrega</span>
                <span className="tabular">{formatCurrency(deliveryFee)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-on-surface">Total</span>
              <span className="tabular text-price-display text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
          {error ? <p className="text-label-sm text-error">{error}</p> : null}
          <Button
            size="lg"
            block
            disabled={submitting || lines.length === 0}
            onClick={handleSubmit}
          >
            <Icon name="send" />
            {submitting ? "Enviando..." : "Confirmar pedido"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-space-lg">
        <div className="grid grid-cols-3 gap-space-xs">
          {(Object.keys(channelLabels) as Channel[]).map((option) => {
            const disabled = option === "dine_in" && !sessionId;
            const active = channel === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => setChannel(option)}
                className={cn(
                  "flex flex-col items-center gap-space-2xs rounded-lg border px-space-sm py-space-sm text-label-md transition-colors",
                  active
                    ? "border-primary bg-primary-container text-on-primary-container"
                    : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <Icon name={channelLabels[option].icon} />
                {channelLabels[option].label}
              </button>
            );
          })}
        </div>

        {channel === "dine_in" ? (
          <div className="flex items-center gap-space-sm rounded-lg bg-surface-container-low p-space-sm">
            <Icon name="table_restaurant" className="text-primary" />
            <p className="text-body-sm text-on-surface-variant">
              {sessionId
                ? `Pedido na mesa ${tableLabel ?? ""} — a conta será fechada pelo restaurante.`
                : "Escaneie o QR code da mesa para pedir no local."}
            </p>
          </div>
        ) : null}

        {channel !== "dine_in" ? (
          <div className="flex flex-col gap-space-md">
            <Input
              label="Nome"
              placeholder="Seu nome"
              error={errors.customerName?.message}
              {...(channel === "delivery"
                ? deliveryForm.register("customerName")
                : pickupForm.register("customerName"))}
            />
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              inputMode="tel"
              error={errors.customerPhone?.message}
              {...(channel === "delivery"
                ? deliveryForm.register("customerPhone")
                : pickupForm.register("customerPhone"))}
            />
          </div>
        ) : null}

        {channel === "delivery" ? (
          <div className="grid grid-cols-2 gap-space-md">
            <div className="col-span-2">
              <Input
                label="Rua"
                error={deliveryForm.formState.errors.street?.message}
                {...deliveryForm.register("street")}
              />
            </div>
            <Input
              label="Número"
              error={deliveryForm.formState.errors.number?.message}
              {...deliveryForm.register("number")}
            />
            <Input
              label="Complemento"
              error={deliveryForm.formState.errors.complement?.message}
              {...deliveryForm.register("complement")}
            />
            <Input
              label="Bairro"
              error={deliveryForm.formState.errors.neighborhood?.message}
              {...deliveryForm.register("neighborhood")}
            />
            <Input
              label="CEP"
              error={deliveryForm.formState.errors.zipcode?.message}
              {...deliveryForm.register("zipcode")}
            />
            <Input
              label="Cidade"
              error={deliveryForm.formState.errors.city?.message}
              {...deliveryForm.register("city")}
            />
            <Input
              label="UF"
              maxLength={2}
              error={deliveryForm.formState.errors.state?.message}
              {...deliveryForm.register("state")}
            />
            <div className="col-span-2">
              <Input
                label="Referência"
                error={deliveryForm.formState.errors.reference?.message}
                {...deliveryForm.register("reference")}
              />
            </div>
          </div>
        ) : null}

        <Textarea
          label="Observações do pedido"
          placeholder="Ex.: levar guardanapos, ponto da carne..."
          maxLength={500}
          value={orderNotes}
          onChange={(event) => setOrderNotes(event.target.value)}
        />
      </div>
    </Dialog>
  );
}
