import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  parent: z.string().trim().length(24).optional().nullable(),
  icon: z.string().trim().max(80).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  parent: z.string().trim().length(24).optional().nullable(),
  icon: z.string().trim().max(80).optional(),
  isActive: z.boolean().optional(),
});
