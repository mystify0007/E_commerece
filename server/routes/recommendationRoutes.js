import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import * as recommendationController from "../controllers/recommendationController.js";

const router = Router();

router.get("/popular", recommendationController.popular);
router.get("/similar/:productId", recommendationController.similar);
router.get("/for-you", authenticate, requireRole("customer"), recommendationController.forYou);
router.get("/wishlist-based", authenticate, requireRole("customer"), recommendationController.wishlistBased);

export default router;
