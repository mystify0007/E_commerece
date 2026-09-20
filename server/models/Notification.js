import mongoose from "mongoose";

const { Schema } = mongoose;

export const NOTIFICATION_TYPES = [
  "registration",
  "artisan_verification",
  "product_approval",
  "new_order",
  "order_status_change",
  "custom_request",
  "custom_proposal",
  "proposal_accepted",
  "production_status_change",
  "payment_status",
  "review",
  "complaint_response",
];

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    relatedEntityType: { type: String, default: null },
    relatedEntity: { type: Schema.Types.ObjectId, refPath: "relatedEntityType", default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
