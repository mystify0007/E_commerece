import { Artisan } from "../models/Artisan.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination } from "../utils/paginate.js";
import { createNotification } from "./notificationService.js";
import { logAdminAction } from "./auditService.js";

export async function getArtisanProfileByUserId(userId) {
  const artisan = await Artisan.findOne({ user: userId });
  if (!artisan) {
    throw ApiError.notFound("Artisan profile not found");
  }
  return artisan;
}

export async function updateMyArtisanProfile(userId, updates) {
  const artisan = await getArtisanProfileByUserId(userId);
  Object.assign(artisan, updates);
  await artisan.save();
  return artisan;
}

export async function listApprovedArtisans({ page, limit, search }) {
  const { skip, limit: pageLimit } = parsePagination({ page, limit });
  const query = { verificationStatus: "approved" };
  if (search) {
    query.$text = { $search: search };
  }

  const [items, total] = await Promise.all([
    Artisan.find(query).sort({ ratingAvg: -1, createdAt: -1 }).skip(skip).limit(pageLimit).populate("user", "name avatarUrl"),
    Artisan.countDocuments(query),
  ]);

  return { items, total, page: page || 1, limit: pageLimit };
}

export async function listArtisansForAdmin({ status, page, limit }) {
  const { skip, limit: pageLimit, page: p } = parsePagination({ page, limit });
  const query = {};
  if (status && status !== "all") query.verificationStatus = status;

  const [items, total] = await Promise.all([
    Artisan.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit).populate("user", "name email"),
    Artisan.countDocuments(query),
  ]);

  return { items, total, page: p, limit: pageLimit };
}

export async function getPublicArtisanProfile(artisanId, requester) {
  const artisan = await Artisan.findById(artisanId).populate("user", "name avatarUrl");
  if (!artisan) throw ApiError.notFound("Artisan not found");

  const isOwner = requester && artisan.user._id.toString() === requester._id.toString();
  const isAdmin = requester?.role === "admin";
  if (artisan.verificationStatus !== "approved" && !isOwner && !isAdmin) {
    throw ApiError.notFound("Artisan not found");
  }

  return artisan;
}

export async function verifyArtisan(artisanId, { status, note }, admin) {
  const artisan = await Artisan.findById(artisanId);
  if (!artisan) throw ApiError.notFound("Artisan not found");

  const before = artisan.verificationStatus;
  artisan.verificationStatus = status;
  artisan.verificationNote = note;
  artisan.verifiedAt = new Date();
  artisan.verifiedBy = admin._id;
  await artisan.save();

  await logAdminAction({
    admin: admin._id,
    action: "artisan.verify",
    targetType: "Artisan",
    target: artisan._id,
    before: { verificationStatus: before },
    after: { verificationStatus: status, note },
  });

  await createNotification({
    user: artisan.user,
    type: "artisan_verification",
    title: status === "approved" ? "You're verified!" : "Verification update",
    message:
      status === "approved"
        ? "Your artisan shop has been verified. You can now list products for sale."
        : `Your verification request was not approved.${note ? ` Reason: ${note}` : ""}`,
    relatedEntityType: "Artisan",
    relatedEntity: artisan._id,
  });

  return artisan;
}

export function assertArtisanCanSell(artisan) {
  if (artisan.verificationStatus !== "approved") {
    throw ApiError.forbidden("Your artisan account must be verified by an admin before you can list products");
  }
}
