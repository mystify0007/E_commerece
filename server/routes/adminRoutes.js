import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  listUsersQuerySchema,
  updateUserStatusSchema,
  adminListQuerySchema,
} from "../validators/adminValidators.js";
import * as adminController from "../controllers/adminController.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/dashboard", adminController.getDashboard);
router.get("/users", validateQuery(listUsersQuerySchema), adminController.listUsers);
router.patch("/users/:id/status", validateBody(updateUserStatusSchema), adminController.updateUserStatus);
router.get("/artisans", validateQuery(adminListQuerySchema), adminController.listArtisans);
router.get("/products", validateQuery(adminListQuerySchema), adminController.listProducts);

export default router;
