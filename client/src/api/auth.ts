import { request } from "./client.js";

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { email: string; role: string } }>(
      "/auth/login", { method: "POST", body: { email, password } }
    ),
  register: (email: string, password: string) =>
    request<{ pending: boolean }>(
      "/auth/register", { method: "POST", body: { email, password } }
    ),
  me: () => request<{ email: string; role: string; isAdmin: boolean }>("/auth/me"),
};
