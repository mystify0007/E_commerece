import { api } from "./api.js";

export async function listCategoriesRequest() {
  const { data } = await api.get("/categories");
  return data.data;
}
