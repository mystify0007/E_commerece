import { z } from "zod";

const objectId = z.string().trim().length(24);

export const createProductSchema = z.object({
  category: objectId,
  name: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
  brand: z.string().trim().max(80).optional(),
  material: z.string().trim().min(2).max(80),
  colors: z.array(z.string().trim()).min(1),
  sizesAvailable: z.array(z.coerce.number().min(15).max(55)).min(1),
  soleType: z.string().trim().max(80).optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string().url()).min(1).max(6),
  isHandmade: z.coerce.boolean().default(true),
  isCustomizable: z.coerce.boolean().default(false),
  productionTimeDays: z.coerce.number().min(0).default(0),
  tags: z.array(z.string().trim().toLowerCase()).max(20).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const moderateProductSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(1000).optional(),
});

export const myProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(20),
});

export const listProductsQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  category: objectId.optional(),
  artisan: objectId.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  size: z.coerce.number().optional(),
  color: z.string().trim().optional(),
  material: z.string().trim().optional(),
  soleType: z.string().trim().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  customizable: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(20),
});
