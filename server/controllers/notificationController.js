import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as notificationService from "../services/notificationService.js";

export const list = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(req.user._id, req.validatedQuery);
  sendSuccess(res, 200, result);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user._id, req.params.id);
  sendSuccess(res, 200, notification);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  sendSuccess(res, 200, null, "All notifications marked as read");
});
