import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody } from "../middleware/validate.js";
import { productAssistSchema } from "../validators/aiValidators.js";
import * as aiController from "../controllers/aiController.js";

const router = Router();

router.post("/product-assist", authenticate, requireRole("artisan"), validateBody(productAssistSchema), aiController.productAssist);

export default router;
