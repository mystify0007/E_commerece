import { api } from "./api.js";

export async function listNotificationsRequest(params) {
  const { data } = await api.get("/notifications", { params });
  return data.data;
}

export async function markNotificationReadRequest(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data;
}

export async function markAllNotificationsReadRequest() {
  const { data } = await api.patch("/notifications/read-all");
  return data;
}
