import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as aiAssistService from "../services/aiAssistService.js";

export const productAssist = asyncHandler(async (req, res) => {
  const suggestions = await aiAssistService.suggestProductAttributes(req.body);
  sendSuccess(res, 200, suggestions);
});
