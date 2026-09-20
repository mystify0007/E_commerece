import { api } from "./api.js";

export async function listProductsRequest(params) {
  const { data } = await api.get("/products", { params });
  return data.data; // { items, page, limit, total, totalPages }
}

export async function getProductRequest(id) {
  const { data } = await api.get(`/products/${id}`);
  return data.data;
}

export async function getSimilarProductsRequest(id) {
  const { data } = await api.get(`/products/${id}/similar`);
  return data.data;
}

export async function listMyProductsRequest(params) {
  const { data } = await api.get("/products/mine", { params });
  return data.data;
}

export async function createProductRequest(payload) {
  const { data } = await api.post("/products", payload);
  return data.data;
}

export async function updateProductRequest(id, payload) {
  const { data } = await api.patch(`/products/${id}`, payload);
  return data.data;
}

export async function archiveProductRequest(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

export async function uploadProductImagesRequest(files) {
  const formData = new FormData();
  for (const file of files) formData.append("images", file);
  const { data } = await api.post("/products/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.urls;
}
