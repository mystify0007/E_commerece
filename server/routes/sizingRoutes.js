import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { recommendSizeSchema } from "../validators/sizingValidators.js";
import * as sizingController from "../controllers/sizingController.js";

const router = Router();

router.post("/recommend", validateBody(recommendSizeSchema), sizingController.recommend);

export default router;
