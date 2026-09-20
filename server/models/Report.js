import mongoose from "mongoose";

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["Product", "Review", "User", "Order", "Artisan"], required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },
    reason: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["open", "investigating", "resolved", "dismissed"], default: "open" },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, trim: true },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model("Report", reportSchema);
