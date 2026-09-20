import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as categoryService from "../services/categoryService.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories();
  sendSuccess(res, 200, categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, 201, category, "Category created");
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, 200, category, "Category updated");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  sendSuccess(res, 200, null, "Category deleted");
});
