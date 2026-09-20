import { mockProvider } from "./providers/mockProvider.js";
import { codProvider } from "./providers/codProvider.js";
import { esewaProvider } from "./providers/esewaProvider.js";
import { khaltiProvider } from "./providers/khaltiProvider.js";
import { Payment } from "../../models/Payment.js";
import { ApiError } from "../../utils/ApiError.js";

const PROVIDERS = {
  mock: mockProvider,
  cod: codProvider,
  esewa: esewaProvider,
  khalti: khaltiProvider,
};

export function getProvider(name) {
  const provider = PROVIDERS[name];
  if (!provider) throw ApiError.badRequest(`Unknown payment provider: ${name}`);
  return provider;
}

// Creates the Payment record for an order using the chosen provider. Runs
// inside the caller's transaction session when one is provided. Returns the
// payment record plus any redirect instructions the frontend must follow
// (e.g. eSewa's signed form POST) — null for providers that settle inline.
export async function initiatePayment(order, providerName, session) {
  const provider = getProvider(providerName);
  const result = await provider.initiate(order);

  const [payment] = await Payment.create(
    [
      {
        order: order._id,
        provider: providerName,
        amount: order.total,
        status: result.status,
        providerTransactionId: result.providerTransactionId,
        paidAt: result.paidAt,
      },
    ],
    { session }
  );

  return { payment, redirect: result.redirect || null };
}

export async function verifyPayment(payment) {
  const provider = getProvider(payment.provider);
  const result = await provider.verify(payment);
  payment.status = result.status;
  if (result.status === "success" && !payment.paidAt) payment.paidAt = new Date();
  await payment.save();
  return payment;
}
