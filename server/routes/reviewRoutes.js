import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { createReviewSchema, moderateReviewSchema, listReviewsQuerySchema } from "../validators/reviewValidators.js";
import * as reviewController from "../controllers/reviewController.js";

const router = Router();

router.post("/", authenticate, requireRole("customer"), validateBody(createReviewSchema), reviewController.create);
router.get("/product/:productId", validateQuery(listReviewsQuerySchema), reviewController.listForProduct);
router.get("/artisan/:artisanId", validateQuery(listReviewsQuerySchema), reviewController.listForArtisan);
router.patch(
  "/:id/moderate",
  authenticate,
  requireRole("admin"),
  validateBody(moderateReviewSchema),
  reviewController.moderate
);

export default router;
