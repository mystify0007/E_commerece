import mongoose from "mongoose";

const { Schema } = mongoose;

const userPreferenceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    preferredCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    preferredColors: [{ type: String, trim: true }],
    preferredMaterials: [{ type: String, trim: true }],
    priceRange: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 0, default: null },
    },
    preferredArtisans: [{ type: Schema.Types.ObjectId, ref: "Artisan" }],
  },
  { timestamps: true }
);

export const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);
