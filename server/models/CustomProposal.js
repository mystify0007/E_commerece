import mongoose from "mongoose";

const { Schema } = mongoose;

const customProposalSchema = new Schema(
  {
    customOrder: { type: Schema.Types.ObjectId, ref: "CustomOrder", required: true },
    artisan: { type: Schema.Types.ObjectId, ref: "Artisan", required: true },
    proposedDesignNotes: { type: String, required: true, trim: true, maxlength: 3000 },
    price: { type: Number, required: true, min: 0 },
    productionTimeDays: { type: Number, required: true, min: 0 },
    depositRequired: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "revision_requested"],
      default: "pending",
    },
    customerNote: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

customProposalSchema.index({ customOrder: 1, status: 1 });
customProposalSchema.index({ artisan: 1 });

export const CustomProposal = mongoose.model("CustomProposal", customProposalSchema);
