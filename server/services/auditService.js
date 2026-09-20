import { AuditLog } from "../models/AuditLog.js";

export async function logAdminAction({ admin, action, targetType, target, before, after, ip }) {
  return AuditLog.create({ admin, action, targetType, target, before, after, ip });
}
