import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import * as reviewService from "../services/reviewService.js";

export const create = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user._id, req.body);
  sendSuccess(res, 201, review, "Review submitted");
});

export const listForProduct = asyncHandler(async (req, res) => {
  const result = await reviewService.listReviewsForTarget("Product", req.params.productId, req.validatedQuery);
  sendPaginated(res, result);
});

export const listForArtisan = asyncHandler(async (req, res) => {
  const result = await reviewService.listReviewsForTarget("Artisan", req.params.artisanId, req.validatedQuery);
  sendPaginated(res, result);
});

export const moderate = asyncHandler(async (req, res) => {
  const review = await reviewService.moderateReview(req.params.id, req.body.status);
  sendSuccess(res, 200, review, "Review moderated");
});
