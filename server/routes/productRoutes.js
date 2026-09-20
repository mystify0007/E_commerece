import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { uploadImages } from "../middleware/upload.js";
import {
  createProductSchema,
  updateProductSchema,
  moderateProductSchema,
  listProductsQuerySchema,
  myProductsQuerySchema,
} from "../validators/productValidators.js";
import * as productController from "../controllers/productController.js";

const router = Router();

router.get("/", validateQuery(listProductsQuerySchema), productController.listProducts);
router.get(
  "/mine",
  authenticate,
  requireRole("artisan"),
  validateQuery(myProductsQuerySchema),
  productController.listMyProducts
);
router.post(
  "/images",
  authenticate,
  requireRole("artisan"),
  uploadImages.array("images", 6),
  productController.uploadProductImages
);
router.get("/:id", optionalAuthenticate, productController.getProduct);
router.get("/:id/similar", productController.getSimilarProducts);
router.post(
  "/",
  authenticate,
  requireRole("artisan"),
  validateBody(createProductSchema),
  productController.createProduct
);
router.patch(
  "/:id",
  authenticate,
  requireRole("artisan"),
  validateBody(updateProductSchema),
  productController.updateProduct
);
router.delete("/:id", authenticate, requireRole("artisan"), productController.deleteProduct);
router.patch(
  "/:id/moderate",
  authenticate,
  requireRole("admin"),
  validateBody(moderateProductSchema),
  productController.moderateProduct
);

export default router;
