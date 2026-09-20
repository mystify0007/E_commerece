import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Payment } from "../models/Payment.js";
import { Order } from "../models/Order.js";
import { verifyPayment } from "../services/paymentService/index.js";

export const verify = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw ApiError.notFound("Order not found");
  if (order.customer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw ApiError.forbidden("You do not have access to this order's payment");
  }

  const payment = await Payment.findOne({ order: order._id });
  if (!payment) throw ApiError.notFound("Payment record not found");

  const updated = await verifyPayment(payment);
  sendSuccess(res, 200, updated, "Payment status refreshed");
});
