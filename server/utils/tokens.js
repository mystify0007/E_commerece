import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function generateRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString(), tokenVersion: user.tokenVersion || 0 }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
