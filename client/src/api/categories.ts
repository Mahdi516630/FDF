import { request } from "./client.js";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "../types.js";

export const categoriesApi = {
  list:   ()                                          => request<Category[]>("/categories"),
  create: (body: CreateCategoryPayload)               => request<Category>("/categories", { method: "POST", body }),
  update: (id: string, body: UpdateCategoryPayload)   => request<Category>(`/categories/${id}`, { method: "PUT", body }),
  remove: (id: string)                                => request<{ ok: true }>(`/categories/${id}`, { method: "DELETE" }),
};
