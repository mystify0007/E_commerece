import { CustomizationOption } from "../models/CustomizationOption.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { getArtisanProfileByUserId } from "./artisanService.js";
import { calculateLineItemPrice } from "./pricingService.js";

export async function listActiveOptions(productId) {
  return CustomizationOption.find({ product: productId, isActive: true }).sort({ type: 1, priceDelta: 1 });
}

async function loadOwnedProduct(userId, productId) {
  const artisan = await getArtisanProfileByUserId(userId);
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Product not found");
  if (product.artisan.toString() !== artisan._id.toString()) {
    throw ApiError.forbidden("You do not have access to this product");
  }
  return product;
}

export async function listOptionsForOwner(userId, productId) {
  await loadOwnedProduct(userId, productId);
  return CustomizationOption.find({ product: productId }).sort({ type: 1, createdAt: 1 });
}

export async function createOption(userId, productId, payload) {
  const product = await loadOwnedProduct(userId, productId);

  const option = await CustomizationOption.create({ ...payload, product: product._id });

  if (!product.isCustomizable) {
    product.isCustomizable = true;
    await product.save();
  }

  return option;
}

async function loadOwnedOption(userId, optionId) {
  const option = await CustomizationOption.findById(optionId);
  if (!option) throw ApiError.notFound("Customization option not found");
  await loadOwnedProduct(userId, option.product);
  return option;
}

export async function updateOption(userId, optionId, updates) {
  const option = await loadOwnedOption(userId, optionId);
  Object.assign(option, updates);
  await option.save();
  return option;
}

export async function deleteOption(userId, optionId) {
  const option = await loadOwnedOption(userId, optionId);
  await option.deleteOne();
}

export async function previewPrice(productId, customizationOptionIds) {
  const product = await Product.findById(productId);
  if (!product || product.status !== "approved") throw ApiError.notFound("Product not found");

  const { unitPrice, selections } = await calculateLineItemPrice(product, customizationOptionIds);
  return { basePrice: product.price, selections, finalPrice: unitPrice };
}
