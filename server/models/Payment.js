import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    provider: { type: String, enum: ["esewa", "khalti", "cod", "mock"], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NPR" },
    status: {
      type: String,
      enum: ["initiated", "success", "failed", "refunded"],
      default: "initiated",
    },
    providerTransactionId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
