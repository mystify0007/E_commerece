import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { updateProfileSchema } from "../validators/authValidators.js";
import * as userController from "../controllers/userController.js";

const router = Router();

router.patch("/me", authenticate, validateBody(updateProfileSchema), userController.updateMe);
router.get("/:id", userController.getPublicProfile);

export default router;
