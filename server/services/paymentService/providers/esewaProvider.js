import { ApiError } from "../../../utils/ApiError.js";
import { env } from "../../../config/env.js";

// eSewa (Nepal) adapter. This implements the PaymentProvider interface the
// rest of the app depends on, but the actual request/response field names
// for eSewa's ePay API must be confirmed against their current sandbox
// documentation before this can process a real transaction — we don't ship
// a guessed signature/field format pretending to work. Configure
// PAYMENT_API_KEY / PAYMENT_SECRET in .env, then fill in initiate()/verify()
// per eSewa's docs (developer.esewa.com.np) to go live.
export const esewaProvider = {
  name: "esewa",
  async initiate(order) {
    if (!env.payment.apiKey || !env.payment.secret) {
      throw ApiError.badRequest(
        "eSewa is not configured. Set PAYMENT_API_KEY and PAYMENT_SECRET in the server .env, then complete " +
          "services/paymentService/providers/esewaProvider.js against eSewa's current sandbox API docs."
      );
    }
    throw ApiError.badRequest("eSewa integration is configured but not yet implemented for this deployment.");
  },
  async verify() {
    throw ApiError.badRequest("eSewa verification is not yet implemented for this deployment.");
  },
};
