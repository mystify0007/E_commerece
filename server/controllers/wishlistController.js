import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as wishlistService from "../services/wishlistService.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);
  sendSuccess(res, 200, wishlist);
});

export const addItem = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.addToWishlist(req.user._id, req.params.productId);
  sendSuccess(res, 201, wishlist, "Added to wishlist");
});

export const removeItem = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeFromWishlist(req.user._id, req.params.productId);
  sendSuccess(res, 200, wishlist, "Removed from wishlist");
});
