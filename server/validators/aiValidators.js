import { z } from "zod";

export const productAssistSchema = z.object({
  name: z.string().trim().max(150).optional(),
  description: z.string().trim().max(5000).optional(),
  imageUrl: z.string().url().optional(),
});
