import { request } from "./client.js";
import type { Referee, CreateRefereePayload, UpdateRefereePayload } from "../types.js";

export const refereesApi = {
  list:   ()                                        => request<Referee[]>("/referees"),
  create: (body: CreateRefereePayload)              => request<Referee>("/referees", { method: "POST", body }),
  update: (id: string, body: UpdateRefereePayload)  => request<Referee>(`/referees/${id}`, { method: "PUT", body }),
  remove: (id: string)                              => request<{ ok: true }>(`/referees/${id}`, { method: "DELETE" }),
};
