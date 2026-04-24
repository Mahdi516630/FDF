import { request } from "./client.js";

export const adminApi = {
  listPending: () => request<{ id: string; email: string; createdAt: string }[]>("/admin/pending-users"),
  approve:     (id: string) => request<{ ok: true }>(`/admin/approve/${id}`, { method: "POST" }),
  reject:      (id: string) => request<{ ok: true }>(`/admin/reject/${id}`, { method: "DELETE" }),
};
