import { z } from "zod";

export const recommendSizeSchema = z.object({
  footLengthCm: z.coerce.number().min(10).max(40),
  footWidthCm: z.coerce.number().min(5).max(20).optional(),
  preferredFit: z.enum(["snug", "regular", "loose"]).default("regular"),
  product: z.string().trim().length(24).optional(),
});
