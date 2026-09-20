import mongoose from "mongoose";

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true },
    targetType: { type: String, trim: true },
    target: { type: Schema.Types.ObjectId, refPath: "targetType", default: null },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ admin: 1, createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
