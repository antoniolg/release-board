const BASE = "/api";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let csrfToken = null;

async function getCsrfToken(refresh = false) {
  if (!csrfToken || refresh) {
    const res = await fetch(`${BASE}/csrf-token`, { credentials: "same-origin" });
    if (!res.ok) throw new Error("Could not get CSRF token");
    csrfToken = (await res.json()).csrfToken;
  }
  return csrfToken;
}

async function send(path, opts, refreshToken) {
  const method = (opts.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (!SAFE_METHODS.has(method)) {
    headers["X-CSRF-Token"] = await getCsrfToken(refreshToken);
  }
  return fetch(`${BASE}${path}`, { credentials: "same-origin", ...opts, headers });
}

async function request(path, opts = {}) {
  let res = await send(path, opts, false);
  if (res.status === 403 && !SAFE_METHODS.has((opts.method || "GET").toUpperCase())) {
    // The token may have expired with the cookie: fetch a fresh one and retry once.
    res = await send(path, opts, true);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  getReleases: () => request("/releases"),
  createRelease: (data) => request("/releases", { method: "POST", body: JSON.stringify(data) }),
  deleteRelease: (id) => request(`/releases/${id}`, { method: "DELETE" }),

  getColumns: (releaseId) => request(`/columns/${releaseId}`),
  createColumn: (data) => request("/columns", { method: "POST", body: JSON.stringify(data) }),
  updateColumn: (id, data) => request(`/columns/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteColumn: (id) => request(`/columns/${id}`, { method: "DELETE" }),

  getCardsByRelease: (releaseId) => request(`/cards/release/${releaseId}`),
  getCardsByColumn: (columnId) => request(`/cards/column/${columnId}`),
  createCard: (data) => request("/cards", { method: "POST", body: JSON.stringify(data) }),
  updateCard: (id, data) => request(`/cards/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  moveCard: (id, data) => request(`/cards/${id}/move`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCard: (id) => request(`/cards/${id}`, { method: "DELETE" }),

  createChecklistItem: (data) => request("/checklists", { method: "POST", body: JSON.stringify(data) }),
  updateChecklistItem: (id, data) => request(`/checklists/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteChecklistItem: (id) => request(`/checklists/${id}`, { method: "DELETE" }),
};
