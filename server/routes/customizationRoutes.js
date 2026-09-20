import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody } from "../middleware/validate.js";
import {
  createCustomizationOptionSchema,
  updateCustomizationOptionSchema,
  pricePreviewSchema,
} from "../validators/customizationValidators.js";
import * as customizationController from "../controllers/customizationController.js";

const router = Router();

router.get("/product/:productId", customizationController.listForProduct);
router.get(
  "/product/:productId/mine",
  authenticate,
  requireRole("artisan"),
  customizationController.listOwnedForProduct
);
router.post(
  "/product/:productId",
  authenticate,
  requireRole("artisan"),
  validateBody(createCustomizationOptionSchema),
  customizationController.create
);
router.patch(
  "/:id",
  authenticate,
  requireRole("artisan"),
  validateBody(updateCustomizationOptionSchema),
  customizationController.update
);
router.delete("/:id", authenticate, requireRole("artisan"), customizationController.remove);
router.post("/price-preview", validateBody(pricePreviewSchema), customizationController.pricePreview);

export default router;
