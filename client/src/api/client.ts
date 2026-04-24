// =============================================================================
// client/src/api/client.ts
// Seul endroit dans tout le projet qui appelle fetch()
// JWT injecté ici — les features n'y touchent jamais directement
// =============================================================================

const TOKEN_KEY = "referee_v3_token";

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); }
  catch { return null; }
}

export function setToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
  }
}

export async function request<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? `HTTP_${res.status}`, data);
  }
  return data as T;
}
