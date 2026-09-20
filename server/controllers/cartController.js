import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as cartService from "../services/cartService.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCartWithPricing(req.user._id);
  sendSuccess(res, 200, cart);
});

export const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItemToCart(req.user._id, req.body);
  sendSuccess(res, 201, cart, "Added to cart");
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItemQuantity(req.user._id, req.params.itemId, req.body.quantity);
  sendSuccess(res, 200, cart, "Cart updated");
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeCartItem(req.user._id, req.params.itemId);
  sendSuccess(res, 200, cart, "Item removed");
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user._id);
  sendSuccess(res, 200, null, "Cart cleared");
});
