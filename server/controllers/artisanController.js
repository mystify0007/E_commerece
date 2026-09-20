import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import * as artisanService from "../services/artisanService.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const artisan = await artisanService.getArtisanProfileByUserId(req.user._id);
  sendSuccess(res, 200, artisan);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const artisan = await artisanService.updateMyArtisanProfile(req.user._id, req.body);
  sendSuccess(res, 200, artisan, "Shop profile updated");
});

export const listArtisans = asyncHandler(async (req, res) => {
  const result = await artisanService.listApprovedArtisans(req.validatedQuery);
  sendPaginated(res, result);
});

export const getArtisanProfile = asyncHandler(async (req, res) => {
  const artisan = await artisanService.getPublicArtisanProfile(req.params.id, req.user);
  sendSuccess(res, 200, artisan);
});

export const verifyArtisan = asyncHandler(async (req, res) => {
  const artisan = await artisanService.verifyArtisan(req.params.id, req.body, req.user);
  sendSuccess(res, 200, artisan, `Artisan ${req.body.status}`);
});
