import { z } from "zod";
import { PRODUCTION_STAGES } from "../models/CustomOrder.js";

const objectId = z.string().trim().length(24);

export const createCustomOrderSchema = z.object({
  targetArtisan: objectId.optional(),
  shoeType: z.string().trim().min(2).max(80),
  size: z.coerce.number(),
  footMeasurements: z
    .object({
      lengthCm: z.coerce.number().min(0).optional(),
      widthCm: z.coerce.number().min(0).optional(),
    })
    .optional(),
  preferredColor: z.string().trim().max(80).optional(),
  material: z.string().trim().max(80).optional(),
  sole: z.string().trim().max(80).optional(),
  designDescription: z.string().trim().min(10).max(3000),
  budget: z.coerce.number().min(0).optional(),
  requiredDate: z.coerce.date().optional(),
  referenceImages: z.array(z.string().url()).max(6).optional(),
});

export const createProposalSchema = z.object({
  proposedDesignNotes: z.string().trim().min(10).max(3000),
  price: z.coerce.number().min(0),
  productionTimeDays: z.coerce.number().min(0),
  depositRequired: z.coerce.number().min(0).default(0),
});

export const respondToProposalSchema = z.object({
  action: z.enum(["accept", "reject", "revision_requested"]),
  customerNote: z.string().trim().max(1000).optional(),
});

export const updateStageSchema = z.object({
  stage: z.enum([...PRODUCTION_STAGES, "rejected", "cancelled"]),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
