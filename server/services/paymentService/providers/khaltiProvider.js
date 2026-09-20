import { ApiError } from "../../../utils/ApiError.js";
import { env } from "../../../config/env.js";

// Khalti (Nepal) adapter — same status as esewaProvider.js: implements the
// common interface, but the real ePayment initiate/lookup request shapes
// need to be filled in against Khalti's current sandbox docs
// (docs.khalti.com) with real credentials before this can process a real
// transaction. We intentionally do not ship guessed API field names as if
// they were verified.
export const khaltiProvider = {
  name: "khalti",
  async initiate(order) {
    if (!env.payment.apiKey || !env.payment.secret) {
      throw ApiError.badRequest(
        "Khalti is not configured. Set PAYMENT_API_KEY and PAYMENT_SECRET in the server .env, then complete " +
          "services/paymentService/providers/khaltiProvider.js against Khalti's current sandbox API docs."
      );
    }
    throw ApiError.badRequest("Khalti integration is configured but not yet implemented for this deployment.");
  },
  async verify() {
    throw ApiError.badRequest("Khalti verification is not yet implemented for this deployment.");
  },
};
