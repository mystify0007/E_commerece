import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { uploadImages, uploadBufferToCloudinary } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import {
  createCustomOrderSchema,
  createProposalSchema,
  respondToProposalSchema,
  updateStageSchema,
  listQuerySchema,
} from "../validators/customOrderValidators.js";
import * as customOrderController from "../controllers/customOrderController.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("customer"), validateBody(createCustomOrderSchema), customOrderController.create);
router.post(
  "/images",
  requireRole("customer"),
  uploadImages.array("images", 6),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) throw ApiError.badRequest("At least one image file is required");
    const results = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer, { folder: "juttax/custom-orders" }))
    );
    sendSuccess(res, 201, { urls: results.map((r) => r.secure_url) });
  })
);
router.get("/me", requireRole("customer"), validateQuery(listQuerySchema), customOrderController.listMine);
router.get(
  "/artisan/inbox",
  requireRole("artisan"),
  validateQuery(listQuerySchema),
  customOrderController.listArtisanInbox
);
router.get("/:id", customOrderController.getOne);
router.post(
  "/:id/proposals",
  requireRole("artisan"),
  validateBody(createProposalSchema),
  customOrderController.createProposal
);
router.patch(
  "/proposals/:proposalId",
  requireRole("customer"),
  validateBody(respondToProposalSchema),
  customOrderController.respondToProposal
);
router.patch("/:id/stage", validateBody(updateStageSchema), customOrderController.updateStage);

export default router;
