import { z } from "zod";

export const createReviewSchema = z.object({
  targetType: z.enum(["Product", "Artisan"]),
  target: z.string().trim().length(24),
  order: z.string().trim().length(24),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

export const moderateReviewSchema = z.object({
  status: z.enum(["visible", "hidden"]),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
