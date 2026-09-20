import { z } from "zod";

export const updateArtisanProfileSchema = z.object({
  shopName: z.string().trim().min(2).max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(120).optional(),
  yearsOfExperience: z.coerce.number().min(0).max(80).optional(),
  specialization: z.array(z.string().trim()).max(20).optional(),
  coverImageUrl: z.string().url().optional(),
});

export const verifyArtisanSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(1000).optional(),
});

export const listArtisansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(200).optional(),
});
