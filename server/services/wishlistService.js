import { Wishlist } from "../models/Wishlist.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";

export async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, items: [] });
  return wishlist;
}

export async function getWishlist(userId) {
  const wishlist = await getOrCreateWishlist(userId);
  await wishlist.populate({
    path: "items.product",
    select: "name images price status ratingAvg ratingCount artisan isHandmade isCustomizable sizesAvailable",
    populate: { path: "artisan", select: "shopName" },
  });
  return wishlist;
}

export async function addToWishlist(userId, productId) {
  const product = await Product.findById(productId);
  if (!product || product.status !== "approved") {
    throw ApiError.notFound("Product not found");
  }

  const wishlist = await getOrCreateWishlist(userId);
  const alreadyIn = wishlist.items.some((item) => item.product.toString() === productId);
  if (!alreadyIn) {
    wishlist.items.push({ product: productId });
    await wishlist.save();
  }
  return getWishlist(userId);
}

export async function removeFromWishlist(userId, productId) {
  const wishlist = await getOrCreateWishlist(userId);
  wishlist.items = wishlist.items.filter((item) => item.product.toString() !== productId);
  await wishlist.save();
  return getWishlist(userId);
}
