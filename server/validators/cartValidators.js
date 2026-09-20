import { z } from "zod";

const objectId = z.string().trim().length(24);

export const addCartItemSchema = z.object({
  product: objectId,
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  size: z.coerce.number(),
  customizationOptions: z.array(objectId).max(10).optional(),
  personalizationText: z.string().trim().max(60).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(20),
});
