import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as recommendationService from "../services/recommendationService.js";
import * as productService from "../services/productService.js";

export const forYou = asyncHandler(async (req, res) => {
  const products = await recommendationService.getRecommendationsForUser(req.user._id);
  sendSuccess(res, 200, products);
});

export const wishlistBased = asyncHandler(async (req, res) => {
  const products = await recommendationService.getWishlistBasedRecommendations(req.user._id);
  sendSuccess(res, 200, products);
});

export const popular = asyncHandler(async (req, res) => {
  const products = await recommendationService.getPopularProducts();
  sendSuccess(res, 200, products);
});

export const similar = asyncHandler(async (req, res) => {
  const products = await productService.getSimilarProducts(req.params.productId);
  sendSuccess(res, 200, products);
});
