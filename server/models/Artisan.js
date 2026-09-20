import mongoose from "mongoose";

const { Schema } = mongoose;

const artisanSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    shopName: { type: String, required: true, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 2000 },
    location: { type: String, trim: true },
    yearsOfExperience: { type: Number, min: 0, default: 0 },
    specialization: [{ type: String, trim: true }],
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationDocs: [{ type: String }],
    verificationNote: { type: String, trim: true },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    coverImageUrl: { type: String },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

artisanSchema.index({ verificationStatus: 1 });
artisanSchema.index({ shopName: "text", bio: "text" });

export const Artisan = mongoose.model("Artisan", artisanSchema);
