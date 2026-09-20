import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import * as adminService from "../services/adminService.js";
import * as artisanService from "../services/artisanService.js";
import * as productService from "../services/productService.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, 200, stats);
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.validatedQuery);
  sendPaginated(res, result);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(req.params.id, req.body.status, req.user);
  sendSuccess(res, 200, user, "User status updated");
});

export const listArtisans = asyncHandler(async (req, res) => {
  const result = await artisanService.listArtisansForAdmin(req.validatedQuery);
  sendPaginated(res, result);
});

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProductsForAdmin(req.validatedQuery);
  sendPaginated(res, result);
});
