import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody } from "../middleware/validate.js";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cartValidators.js";
import * as cartController from "../controllers/cartController.js";

const router = Router();

router.use(authenticate, requireRole("customer"));

router.get("/", cartController.getCart);
router.post("/items", validateBody(addCartItemSchema), cartController.addItem);
router.patch("/items/:itemId", validateBody(updateCartItemSchema), cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;
