import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadBufferToCloudinary } from "../middleware/upload.js";
import * as productService from "../services/productService.js";

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listPublicProducts(req.validatedQuery);
  sendPaginated(res, result);
});

export const listMyProducts = asyncHandler(async (req, res) => {
  const result = await productService.listMyProducts(req.user._id, req.validatedQuery);
  sendPaginated(res, result);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id, req.user);
  sendSuccess(res, 200, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user._id, req.body);
  sendSuccess(res, 201, product, "Product submitted for admin approval");
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateMyProduct(req.user._id, req.params.id, req.body);
  sendSuccess(res, 200, product, "Product updated");
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.archiveMyProduct(req.user._id, req.params.id);
  sendSuccess(res, 200, null, "Product archived");
});

export const moderateProduct = asyncHandler(async (req, res) => {
  const product = await productService.moderateProduct(req.params.id, req.body, req.user);
  sendSuccess(res, 200, product, `Product ${req.body.action}d`);
});

export const getSimilarProducts = asyncHandler(async (req, res) => {
  const products = await productService.getSimilarProducts(req.params.id);
  sendSuccess(res, 200, products);
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    throw ApiError.badRequest("At least one image file is required");
  }

  const results = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, { folder: "juttax/products" }))
  );

  sendSuccess(res, 201, { urls: results.map((r) => r.secure_url) });
});
