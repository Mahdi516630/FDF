import { request } from "./client.js";
import type { RefereeNetPayer } from "../types.js";

export interface ReportingFilters {
  dateFrom?:   string;
  dateTo?:     string;
  categoryId?: string;
}

export const reportingApi = {
  netAPayer: (filters: ReportingFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.dateFrom)   params.set("dateFrom",   filters.dateFrom);
    if (filters.dateTo)     params.set("dateTo",     filters.dateTo);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    const qs = params.toString();
    return request<RefereeNetPayer[]>(`/reporting/net-a-payer${qs ? `?${qs}` : ""}`);
  },
};
