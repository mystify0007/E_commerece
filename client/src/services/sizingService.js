import { api } from "./api.js";

export async function recommendSizeRequest(payload) {
  const { data } = await api.post("/sizing/recommend", payload);
  return data.data;
}
