import crypto from "crypto";
import { User } from "../models/User.js";
import { Cart } from "../models/Cart.js";
import { Wishlist } from "../models/Wishlist.js";
import { Artisan } from "../models/Artisan.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { createNotification } from "./notificationService.js";

export async function registerUser({ name, email, password, role, phone }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role, phone });

  // Every customer gets an empty cart + wishlist ready to use immediately.
  await Promise.all([
    Cart.create({ user: user._id, items: [] }),
    Wishlist.create({ user: user._id, items: [] }),
  ]);

  if (role === "artisan") {
    await Artisan.create({
      user: user._id,
      shopName: `${name}'s Handmade Footwear`,
      verificationStatus: "pending",
    });
  }

  await createNotification({
    user: user._id,
    type: "registration",
    title: "Welcome to JuttaX",
    message:
      role === "artisan"
        ? "Your account was created. Submit your verification documents to start selling."
        : "Your account was created. Start exploring handmade footwear from local artisans.",
  });

  return issueTokens(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (user.status !== "active") {
    throw ApiError.forbidden("This account has been suspended");
  }
  return issueTokens(user);
}

export function issueTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { user: user.toSafeJSON(), accessToken, refreshToken };
}

export async function refreshTokens(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== "active") {
    throw ApiError.unauthorized("User no longer exists or is suspended");
  }
  if ((user.tokenVersion || 0) !== payload.tokenVersion) {
    throw ApiError.unauthorized("Refresh token has been revoked");
  }

  return issueTokens(user);
}

// Bumping tokenVersion invalidates every refresh token issued before this call.
export async function revokeRefreshTokens(userId) {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal whether the email exists.
    return null;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  return rawToken;
}

export async function resetPassword(rawToken, newPassword) {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw ApiError.badRequest("Password reset token is invalid or has expired");
  }

  user.passwordHash = await User.hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1; // invalidate existing sessions
  await user.save();
}

export async function changePassword(user, currentPassword, newPassword) {
  const fullUser = await User.findById(user._id).select("+passwordHash");
  if (!(await fullUser.comparePassword(currentPassword))) {
    throw ApiError.badRequest("Current password is incorrect");
  }
  fullUser.passwordHash = await User.hashPassword(newPassword);
  fullUser.tokenVersion = (fullUser.tokenVersion || 0) + 1;
  await fullUser.save();
}
