import { request } from "./client.js";
import type { DesignationDetail, CreateDesignationPayload, UpdateDesignationPayload } from "../types.js";

export const designationsApi = {
  list:   ()                                                => request<DesignationDetail[]>("/designations"),
  get:    (id: string)                                      => request<DesignationDetail>(`/designations/${id}`),
  create: (body: CreateDesignationPayload)                  => request<DesignationDetail>("/designations", { method: "POST", body }),
  update: (id: string, body: UpdateDesignationPayload)      => request<DesignationDetail>(`/designations/${id}`, { method: "PUT", body }),
  remove: (id: string)                                      => request<{ ok: true }>(`/designations/${id}`, { method: "DELETE" }),
};
