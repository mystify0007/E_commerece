import { z } from "zod";

export const createCustomizationOptionSchema = z.object({
  type: z.enum(["style", "color", "material", "sole", "personalization"]),
  label: z.string().trim().min(1).max(80),
  priceDelta: z.coerce.number().min(0).default(0),
});

export const updateCustomizationOptionSchema = z.object({
  label: z.string().trim().min(1).max(80).optional(),
  priceDelta: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const pricePreviewSchema = z.object({
  product: z.string().trim().length(24),
  customizationOptions: z.array(z.string().trim().length(24)).max(10).default([]),
});
