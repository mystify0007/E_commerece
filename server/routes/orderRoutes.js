import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema, listOrdersQuerySchema } from "../validators/orderValidators.js";
import * as orderController from "../controllers/orderController.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("customer"), validateBody(createOrderSchema), orderController.createOrder);
router.get("/me", requireRole("customer"), validateQuery(listOrdersQuerySchema), orderController.getMyOrders);
router.get(
  "/artisan/mine",
  requireRole("artisan"),
  validateQuery(listOrdersQuerySchema),
  orderController.getArtisanOrderItems
);
router.get("/:id", orderController.getOrder);
router.patch("/:id/status", validateBody(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
