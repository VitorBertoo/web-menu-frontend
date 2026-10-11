import { z } from "zod";

export const customerFields = {
  customerName: z.string().trim().min(2, "Informe seu nome."),
  customerPhone: z
    .string()
    .trim()
    .min(8, "Informe um telefone válido.")
    .max(20, "Telefone muito longo."),
};

export const pickupSchema = z.object({
  ...customerFields,
});

export const deliverySchema = z.object({
  ...customerFields,
  street: z.string().trim().min(1, "Informe a rua."),
  number: z.string().trim().min(1, "Informe o número."),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().min(1, "Informe o bairro."),
  city: z.string().trim().min(1, "Informe a cidade."),
  state: z
    .string()
    .trim()
    .length(2, "Use a sigla do estado (ex.: SP).")
    .transform((value) => value.toUpperCase()),
  zipcode: z.string().trim().min(8, "Informe o CEP."),
  reference: z.string().trim().max(200).optional(),
});

export type PickupFormValues = z.infer<typeof pickupSchema>;
export type DeliveryFormValues = z.infer<typeof deliverySchema>;
