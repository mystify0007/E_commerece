import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import * as orderService from "../services/orderService.js";

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrderFromCart(req.user._id, req.body);
  sendSuccess(res, 201, order, "Order placed successfully");
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getMyOrders(req.user._id, req.validatedQuery);
  sendPaginated(res, result);
});

export const getArtisanOrderItems = asyncHandler(async (req, res) => {
  const result = await orderService.getArtisanOrderItems(req.user._id, req.validatedQuery);
  sendPaginated(res, result);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  sendSuccess(res, 200, order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user);
  sendSuccess(res, 200, order, "Order status updated");
});
