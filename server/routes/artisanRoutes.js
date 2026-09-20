import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  updateArtisanProfileSchema,
  verifyArtisanSchema,
  listArtisansQuerySchema,
} from "../validators/artisanValidators.js";
import * as artisanController from "../controllers/artisanController.js";

const router = Router();

router.get("/", validateQuery(listArtisansQuerySchema), artisanController.listArtisans);
router.get("/me", authenticate, requireRole("artisan"), artisanController.getMyProfile);
router.patch(
  "/me",
  authenticate,
  requireRole("artisan"),
  validateBody(updateArtisanProfileSchema),
  artisanController.updateMyProfile
);
router.get("/:id", optionalAuthenticate, artisanController.getArtisanProfile);
router.patch(
  "/:id/verify",
  authenticate,
  requireRole("admin"),
  validateBody(verifyArtisanSchema),
  artisanController.verifyArtisan
);

export default router;
