import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { listNotificationsQuerySchema } from "../validators/notificationValidators.js";
import * as notificationController from "../controllers/notificationController.js";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listNotificationsQuerySchema), notificationController.list);
router.patch("/:id/read", notificationController.markRead);
router.patch("/read-all", notificationController.markAllRead);

export default router;
