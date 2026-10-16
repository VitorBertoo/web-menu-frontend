import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  position: z.number().int().min(0),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const tableSchema = z.object({
  label: z.string().trim().min(1, "Informe o rótulo da mesa."),
  isActive: z.boolean(),
});
export type TableFormValues = z.infer<typeof tableSchema>;

export const restaurantSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  phone: z.string().trim().optional(),
  isOpen: z.boolean(),
  deliveryFee: z.number().min(0, "Valor inválido."),
});
export type RestaurantFormValues = z.infer<typeof restaurantSchema>;

const componentSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do componente."),
  priceDelta: z.number().min(0, "Valor inválido."),
  isAvailable: z.boolean(),
});

const componentGroupSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome do grupo."),
    minSelect: z.number().int().min(0),
    maxSelect: z.number().int().min(1),
    isRequired: z.boolean(),
    components: z.array(componentSchema).min(1, "Adicione ao menos um componente."),
  })
  .refine((group) => group.maxSelect >= group.minSelect, {
    message: "O máximo deve ser maior ou igual ao mínimo.",
    path: ["maxSelect"],
  })
  .refine((group) => !group.isRequired || group.minSelect >= 1, {
    message: "Grupo obrigatório exige seleção mínima de 1.",
    path: ["minSelect"],
  });

export const productBaseSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  description: z.string().trim().optional(),
  basePrice: z.number().min(0, "Preço inválido."),
  imageUrl: z.string().trim().optional(),
  isAvailable: z.boolean(),
  categoryIds: z.array(z.string()),
});
export type ProductFormValues = z.infer<typeof productBaseSchema>;

export const productInputSchema = productBaseSchema.extend({
  componentGroups: z.array(componentGroupSchema),
});
