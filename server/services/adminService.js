import { User } from "../models/User.js";
import { Artisan } from "../models/Artisan.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination } from "../utils/paginate.js";
import { logAdminAction } from "./auditService.js";

export async function getDashboardStats() {
  const [
    totalCustomers,
    totalArtisans,
    pendingArtisans,
    approvedArtisans,
    totalProducts,
    pendingProducts,
    approvedProducts,
    totalCategories,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "artisan" }),
    Artisan.countDocuments({ verificationStatus: "pending" }),
    Artisan.countDocuments({ verificationStatus: "approved" }),
    Product.countDocuments(),
    Product.countDocuments({ status: "pending" }),
    Product.countDocuments({ status: "approved" }),
    Category.countDocuments(),
  ]);

  return {
    totalCustomers,
    totalArtisans,
    pendingArtisans,
    approvedArtisans,
    totalProducts,
    pendingProducts,
    approvedProducts,
    totalCategories,
  };
}

export async function listUsers({ role, status, search, page, limit }) {
  const { skip, limit: pageLimit, page: p } = parsePagination({ page, limit });
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: new RegExp(escapeRegex(search), "i") },
      { email: new RegExp(escapeRegex(search), "i") },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit),
    User.countDocuments(query),
  ]);

  return { items: items.map((u) => u.toSafeJSON()), total, page: p, limit: pageLimit };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function updateUserStatus(userId, status, admin) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "admin") {
    throw ApiError.forbidden("Admin accounts cannot be suspended through this endpoint");
  }

  const before = user.status;
  user.status = status;
  // Suspending revokes any outstanding refresh tokens immediately.
  if (status === "suspended") user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  await logAdminAction({
    admin: admin._id,
    action: "user.status",
    targetType: "User",
    target: user._id,
    before: { status: before },
    after: { status },
  });

  return user.toSafeJSON();
}
