import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Wishlist } from "../models/Wishlist.js";

// A straightforward content-based recommender: it builds a taste profile
// (preferred categories/materials/colors/price band/artisans) from a
// customer's actual purchase or wishlist history, then scores currently
// approved products against that profile. This is intentionally simple and
// loads the approved-product catalog into memory to score it — fine at the
// scale of a student marketplace project; a larger catalog would need
// DB-level pre-filtering or a proper vector/search index instead.

function buildProfile(products) {
  const categoryCounts = {};
  const materials = new Set();
  const colors = new Set();
  const artisans = new Set();
  let totalPrice = 0;

  for (const p of products) {
    const categoryId = p.category?.toString?.() ?? p.category;
    if (categoryId) categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
    if (p.material) materials.add(p.material.toLowerCase());
    (p.colors || []).forEach((c) => colors.add(c.toLowerCase()));
    const artisanId = p.artisan?.toString?.() ?? p.artisan;
    if (artisanId) artisans.add(artisanId);
    totalPrice += p.price;
  }

  return { categoryCounts, materials, colors, artisans, avgPrice: totalPrice / (products.length || 1) };
}

async function scoreAndRank(profile, { excludeIds, limit }) {
  const candidates = await Product.find({ status: "approved", _id: { $nin: excludeIds } })
    .populate("artisan", "shopName ratingAvg")
    .populate("category", "name");

  const scored = candidates.map((product) => {
    let score = 0;
    const categoryId = product.category?._id?.toString();
    if (categoryId && profile.categoryCounts[categoryId]) score += 5 * profile.categoryCounts[categoryId];
    if (product.material && profile.materials.has(product.material.toLowerCase())) score += 2;
    score += (product.colors || []).filter((c) => profile.colors.has(c.toLowerCase())).length;
    if (profile.avgPrice && product.price >= profile.avgPrice * 0.5 && product.price <= profile.avgPrice * 1.5) {
      score += 2;
    }
    const artisanId = product.artisan?._id?.toString();
    if (artisanId && profile.artisans.has(artisanId)) score += 1;
    score += product.ratingAvg * 0.5; // tie-break toward well-rated items

    return { product, score };
  });

  const ranked = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map((s) => s.product);
}

export async function getPopularProducts(limit = 8) {
  return Product.find({ status: "approved" })
    .sort({ ratingAvg: -1, createdAt: -1 })
    .limit(limit)
    .populate("artisan", "shopName")
    .populate("category", "name");
}

async function getPurchasedProducts(userId) {
  const orders = await Order.find({ customer: userId }).select("_id");
  const orderIds = orders.map((o) => o._id);
  const items = await OrderItem.find({ order: { $in: orderIds } }).populate("product");
  return items.map((i) => i.product).filter(Boolean);
}

export async function getRecommendationsForUser(userId, limit = 8) {
  const purchased = await getPurchasedProducts(userId);
  if (purchased.length === 0) {
    return getPopularProducts(limit);
  }

  const profile = buildProfile(purchased);
  const excludeIds = purchased.map((p) => p._id);
  const ranked = await scoreAndRank(profile, { excludeIds, limit });
  return ranked.length > 0 ? ranked : getPopularProducts(limit);
}

export async function getWishlistBasedRecommendations(userId, limit = 8) {
  const wishlist = await Wishlist.findOne({ user: userId }).populate("items.product");
  const products = (wishlist?.items || []).map((i) => i.product).filter(Boolean);
  if (products.length === 0) return [];

  const profile = buildProfile(products);
  const excludeIds = products.map((p) => p._id);
  return scoreAndRank(profile, { excludeIds, limit });
}
