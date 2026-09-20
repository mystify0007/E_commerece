import { api } from "./api.js";

export async function getProductAssistRequest(payload) {
  const { data } = await api.post("/ai/product-assist", payload);
  return data.data;
}
