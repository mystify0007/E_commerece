import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as authService from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  sendSuccess(res, 201, result, "Account created successfully");
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  sendSuccess(res, 200, result, "Logged in successfully");
});

export const logout = asyncHandler(async (req, res) => {
  await authService.revokeRefreshTokens(req.user._id);
  sendSuccess(res, 200, null, "Logged out successfully");
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken);
  sendSuccess(res, 200, result, "Token refreshed");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const rawToken = await authService.requestPasswordReset(req.body.email);
  // In production this token is emailed, never returned in the API response.
  // It is included here only in non-production environments to make manual testing possible.
  const devPayload = process.env.NODE_ENV !== "production" ? { resetToken: rawToken } : null;
  sendSuccess(res, 200, devPayload, "If that email exists, a password reset link has been sent");
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  sendSuccess(res, 200, null, "Password has been reset. Please log in again.");
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, 200, null, "Password changed. Please log in again.");
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, req.user.toSafeJSON());
});
