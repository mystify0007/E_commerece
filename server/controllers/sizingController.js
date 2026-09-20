import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as sizingService from "../services/sizingService.js";

export const recommend = asyncHandler(async (req, res) => {
  const result = await sizingService.recommendSize(req.body);
  sendSuccess(res, 200, result);
});
