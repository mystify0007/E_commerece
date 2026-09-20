import { z } from "zod";

export const listUsersQuerySchema = z.object({
  role: z.enum(["customer", "artisan", "admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

export const adminListQuerySchema = z.object({
  status: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
