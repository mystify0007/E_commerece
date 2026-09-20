import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody } from "../middleware/validate.js";
import { createCategorySchema, updateCategorySchema } from "../validators/categoryValidators.js";
import * as categoryController from "../controllers/categoryController.js";

const router = Router();

router.get("/", categoryController.listCategories);
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateBody(createCategorySchema),
  categoryController.createCategory
);
router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);
router.delete("/:id", authenticate, requireRole("admin"), categoryController.deleteCategory);

export default router;
