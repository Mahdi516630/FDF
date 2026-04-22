const TOKEN_KEY = "fdf_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

async function request(path, { method = "GET", body, token, headers } = {}) {
  const h = { "Content-Type": "application/json", ...(headers || {}) };
  const t = token ?? getToken();
  if (t) h.Authorization = `Bearer ${t}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error || `HTTP_${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request("/health"),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: { email, password } }),
  me: () => request("/me"),

  listPendingUsers: () => request("/admin/pending-users"),
  approveUser: (id) => request(`/admin/approve/${id}`, { method: "POST" }),
  rejectUser: (id) => request(`/admin/reject/${id}`, { method: "POST" }),

  listReferees: () => request("/referees"),
  addReferee: (r) => request("/referees", { method: "POST", body: r }),
  updateReferee: (id, patch) => request(`/referees/${id}`, { method: "PUT", body: patch }),
  deleteReferee: (id) => request(`/referees/${id}`, { method: "DELETE" }),

  listCategories: () => request("/categories"),
  addCategory: (c) => request("/categories", { method: "POST", body: c }),
  updateCategory: (id, patch) => request(`/categories/${id}`, { method: "PUT", body: patch }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  listDesignations: () => request("/designations"),
  addDesignation: (d) => request("/designations", { method: "POST", body: d }),
  deleteDesignation: (id) => request(`/designations/${id}`, { method: "DELETE" }),
};

