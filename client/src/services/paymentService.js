import { api } from "./api.js";

export async function verifyPaymentRequest(orderId) {
  const { data } = await api.post(`/payments/${orderId}/verify`);
  return data.data;
}
