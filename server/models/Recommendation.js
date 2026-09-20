import mongoose from "mongoose";

const { Schema } = mongoose;

const recommendationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["for_you", "similar", "wishlist_based"], required: true },
    sourceProduct: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        score: { type: Number, required: true },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

recommendationSchema.index({ user: 1, type: 1, sourceProduct: 1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Recommendation = mongoose.model("Recommendation", recommendationSchema);
