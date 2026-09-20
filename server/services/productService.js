import { Product } from "../models/Product.js";
import { Artisan } from "../models/Artisan.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination } from "../utils/paginate.js";
import { getArtisanProfileByUserId, assertArtisanCanSell } from "./artisanService.js";
import { createNotification } from "./notificationService.js";

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating_desc: { ratingAvg: -1 },
};

function buildPublicFilter(query) {
  const filter = { status: "approved" };

  if (query.search) filter.$text = { $search: query.search };
  if (query.category) filter.category = query.category;
  if (query.artisan) filter.artisan = query.artisan;
  if (query.size) filter.sizesAvailable = query.size;
  if (query.color) filter.colors = query.color;
  if (query.material) filter.material = new RegExp(escapeRegex(query.material), "i");
  if (query.soleType) filter.soleType = new RegExp(escapeRegex(query.soleType), "i");
  if (query.customizable !== undefined) filter.isCustomizable = query.customizable;
  if (query.minRating !== undefined) filter.ratingAvg = { $gte: query.minRating };

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  return filter;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listPublicProducts(query) {
  const filter = buildPublicFilter(query);
  const { page, limit, skip } = parsePagination(query);
  const sort = SORTS[query.sort] || SORTS.newest;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("artisan", "shopName ratingAvg verificationStatus")
      .populate("category", "name slug"),
    Product.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function listMyProducts(userId, { page, limit }) {
  const artisan = await getArtisanProfileByUserId(userId);
  const { page: p, limit: l, skip } = parsePagination({ page, limit });

  const [items, total] = await Promise.all([
    Product.find({ artisan: artisan._id }).sort({ createdAt: -1 }).skip(skip).limit(l).populate("category", "name"),
    Product.countDocuments({ artisan: artisan._id }),
  ]);

  return { items, total, page: p, limit: l };
}

export async function getProductById(id, requester) {
  const product = await Product.findById(id)
    .populate("artisan", "shopName ratingAvg ratingCount verificationStatus location")
    .populate("category", "name slug");

  if (!product) throw ApiError.notFound("Product not found");

  const isOwner = requester?.role === "artisan" && (await isArtisanOwner(product, requester._id));
  const isAdmin = requester?.role === "admin";

  if (product.status !== "approved" && !isOwner && !isAdmin) {
    throw ApiError.notFound("Product not found");
  }

  return product;
}

async function isArtisanOwner(product, userId) {
  const artisan = await Artisan.findOne({ user: userId });
  return artisan && product.artisan._id.toString() === artisan._id.toString();
}

export async function createProduct(userId, payload) {
  const artisan = await getArtisanProfileByUserId(userId);
  assertArtisanCanSell(artisan);

  const product = await Product.create({
    ...payload,
    artisan: artisan._id,
    status: "pending",
  });

  return product;
}

async function loadOwnedProduct(productId, userId) {
  const artisan = await getArtisanProfileByUserId(userId);
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Product not found");
  if (product.artisan.toString() !== artisan._id.toString()) {
    throw ApiError.forbidden("You do not have access to this product");
  }
  return product;
}

export async function updateMyProduct(userId, productId, updates) {
  const product = await loadOwnedProduct(productId, userId);
  Object.assign(product, updates);
  await product.save();
  return product;
}

// Soft delete: archives the product instead of removing it, since past
// orders may still reference it via OrderItem.
export async function archiveMyProduct(userId, productId) {
  const product = await loadOwnedProduct(productId, userId);
  product.status = "archived";
  await product.save();
  return product;
}

export async function moderateProduct(productId, { action, rejectionReason }) {
  const product = await Product.findById(productId).populate("artisan", "user");
  if (!product) throw ApiError.notFound("Product not found");

  product.status = action === "approve" ? "approved" : "rejected";
  product.rejectionReason = action === "reject" ? rejectionReason : undefined;
  await product.save();

  await createNotification({
    user: product.artisan.user,
    type: "product_approval",
    title: action === "approve" ? "Product approved" : "Product rejected",
    message:
      action === "approve"
        ? `Your product "${product.name}" is now live on JuttaX.`
        : `Your product "${product.name}" was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
    relatedEntityType: "Product",
    relatedEntity: product._id,
  });

  return product;
}

// Simple content-based similarity for now (same category, nearby price band);
// the full recommendation engine lands in Phase 10.
export async function getSimilarProducts(productId, limit = 8) {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Product not found");

  const priceMin = product.price * 0.6;
  const priceMax = product.price * 1.4;

  return Product.find({
    _id: { $ne: product._id },
    status: "approved",
    category: product.category,
    price: { $gte: priceMin, $lte: priceMax },
  })
    .sort({ ratingAvg: -1 })
    .limit(limit)
    .populate("artisan", "shopName ratingAvg");
}
