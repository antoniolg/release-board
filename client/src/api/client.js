const BASE = "/api";

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
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
