import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import * as wishlistController from "../controllers/wishlistController.js";

const router = Router();

router.use(authenticate, requireRole("customer"));

router.get("/", wishlistController.getWishlist);
router.post("/:productId", wishlistController.addItem);
router.delete("/:productId", wishlistController.removeItem);

export default router;
