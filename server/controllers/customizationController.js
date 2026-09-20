import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as customizationService from "../services/customizationService.js";

export const listForProduct = asyncHandler(async (req, res) => {
  const options = await customizationService.listActiveOptions(req.params.productId);
  sendSuccess(res, 200, options);
});

export const listOwnedForProduct = asyncHandler(async (req, res) => {
  const options = await customizationService.listOptionsForOwner(req.user._id, req.params.productId);
  sendSuccess(res, 200, options);
});

export const create = asyncHandler(async (req, res) => {
  const option = await customizationService.createOption(req.user._id, req.params.productId, req.body);
  sendSuccess(res, 201, option, "Customization option added");
});

export const update = asyncHandler(async (req, res) => {
  const option = await customizationService.updateOption(req.user._id, req.params.id, req.body);
  sendSuccess(res, 200, option, "Customization option updated");
});

export const remove = asyncHandler(async (req, res) => {
  await customizationService.deleteOption(req.user._id, req.params.id);
  sendSuccess(res, 200, null, "Customization option removed");
});

export const pricePreview = asyncHandler(async (req, res) => {
  const result = await customizationService.previewPrice(req.body.product, req.body.customizationOptions);
  sendSuccess(res, 200, result);
});
