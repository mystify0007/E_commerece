import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number (7-15 digits, optional leading +)");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  // The real signup form always collects this (so every new user can log in
  // by phone too), but it stays optional at the schema level rather than
  // forcing every API client — including seed scripts and tests — to supply
  // one just to create an account.
  phone: phoneSchema.optional(),
  password: z.string().min(8).max(72),
  role: z.enum(["customer", "artisan"]).default("customer"),
});

export const loginSchema = z.object({
  // Accepts either an email address or a phone number — checked against
  // both fields server-side rather than trying to guess which one it is.
  identifier: z.string().trim().min(3),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(72),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().optional(),
  avatarUrl: z.string().url().optional(),
});
