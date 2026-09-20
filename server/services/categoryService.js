import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

export async function listCategories() {
  return Category.find({ isActive: true }).sort({ name: 1 });
}

export async function createCategory(payload) {
  return Category.create(payload);
}

export async function updateCategory(id, updates) {
  const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export async function deleteCategory(id) {
  const inUse = await Product.exists({ category: id });
  if (inUse) {
    throw ApiError.conflict("Cannot delete a category that still has products. Deactivate it instead.");
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw ApiError.notFound("Category not found");
}
