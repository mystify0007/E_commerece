import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateBody } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/authValidators.js";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.post("/logout", authenticate, authController.logout);
router.post("/refresh", authController.refresh);
router.post(
  "/forgot-password",
  authLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password/:token",
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);
router.patch(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword
);
router.get("/me", authenticate, authController.getMe);

export default router;
