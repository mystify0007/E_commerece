import crypto from "crypto";
import { ApiError } from "../../../utils/ApiError.js";
import { env } from "../../../config/env.js";

// eSewa (Nepal) ePay v2 sandbox integration — https://developer.esewa.com.np
// Flow: we build a signed form the browser POSTs to eSewa's payment page;
// eSewa redirects the browser back to success_url/failure_url once the
// customer completes (or cancels) payment there; we never trust that
// redirect on its own — the frontend callback always calls our /verify
// endpoint, which independently asks eSewa's status-check API for the
// truth before the Payment record is updated.
const SIGNED_FIELD_NAMES = "total_amount,transaction_uuid,product_code";

function buildSignature(fields) {
  const message = SIGNED_FIELD_NAMES.split(",")
    .map((key) => `${key}=${fields[key]}`)
    .join(",");
  return crypto.createHmac("sha256", env.esewa.secretKey).update(message).digest("base64");
}

const STATUS_MAP = {
  COMPLETE: "success",
  PENDING: "initiated",
  AMBIGUOUS: "initiated",
  CANCELED: "failed",
  NOT_FOUND: "failed",
  FULL_REFUND: "refunded",
  PARTIAL_REFUND: "refunded",
};

export const esewaProvider = {
  name: "esewa",
  async initiate(order) {
    const transactionUuid = order._id.toString();
    const fields = {
      amount: order.subtotal,
      tax_amount: 0,
      product_service_charge: 0,
      product_delivery_charge: order.shippingFee,
      total_amount: order.total,
      transaction_uuid: transactionUuid,
      product_code: env.esewa.productCode,
      success_url: `${env.clientUrl}/payment/esewa/callback?order=${order._id}`,
      failure_url: `${env.clientUrl}/payment/esewa/callback?order=${order._id}`,
      signed_field_names: SIGNED_FIELD_NAMES,
    };
    fields.signature = buildSignature(fields);

    return {
      status: "initiated",
      providerTransactionId: transactionUuid,
      paidAt: null,
      redirect: { method: "POST", url: env.esewa.formUrl, fields },
    };
  },

  async verify(payment) {
    const params = new URLSearchParams({
      product_code: env.esewa.productCode,
      total_amount: String(payment.amount),
      transaction_uuid: payment.providerTransactionId,
    });

    let response;
    try {
      response = await fetch(`${env.esewa.statusUrl}?${params.toString()}`);
    } catch {
      throw ApiError.badGateway("Could not reach eSewa to verify this payment. Please try again shortly.");
    }
    if (!response.ok) {
      throw ApiError.badGateway("eSewa payment status lookup failed.");
    }

    const data = await response.json();
    return { status: STATUS_MAP[data.status] || "initiated" };
  },
};
