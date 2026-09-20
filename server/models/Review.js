import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["Product", "Artisan"], required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000 },
    isVerifiedPurchase: { type: Boolean, default: true },
    status: { type: String, enum: ["visible", "hidden", "reported"], default: "visible" },
  },
  { timestamps: true }
);

// One review per author per target per order (prevents duplicate reviews from the same purchase).
reviewSchema.index({ author: 1, target: 1, order: 1 }, { unique: true });
reviewSchema.index({ targetType: 1, target: 1, status: 1 });

export const Review = mongoose.model("Review", reviewSchema);
