import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as paymentController from "../controllers/paymentController.js";

const router = Router();

router.post("/:orderId/verify", authenticate, paymentController.verify);

export default router;
