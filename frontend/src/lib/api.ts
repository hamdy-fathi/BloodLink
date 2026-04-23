import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bloodlink_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Auth ──
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
};

// ── Users ──
export const usersApi = {
  getOne: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/users/${id}`, data),
};

// ── Donors ──
export const donorsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get("/donors", { params }),
  getOne: (id: string) => api.get(`/donors/${id}`),
  create: (data: Record<string, unknown>) => api.post("/donors", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/donors/${id}`, data),
  toggleAvailability: (id: string) =>
    api.patch(`/donors/${id}/toggle-availability`),
  remove: (id: string) => api.delete(`/donors/${id}`),
};

// ── Inventory ──
export const inventoryApi = {
  getAll: (params?: Record<string, string>) =>
    api.get("/inventory", { params }),
  getOne: (id: string) => api.get(`/inventory/${id}`),
  create: (data: Record<string, unknown>) => api.post("/inventory", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/inventory/${id}`, data),
  remove: (id: string) => api.delete(`/inventory/${id}`),
};

// ── Notifications ──
export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  dismiss: (id: string) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete("/notifications/clear-all"),
};

// ── Emergencies ──
export const emergenciesApi = {
  getAll: () => api.get("/emergencies"),
  getOne: (id: string) => api.get(`/emergencies/${id}`),
  create: (data: Record<string, unknown>) => api.post("/emergencies", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/emergencies/${id}`, data),
  remove: (id: string) => api.delete(`/emergencies/${id}`),
  match: (id: string) => api.get(`/emergencies/${id}/match`),
  notify: (id: string) => api.post(`/emergencies/${id}/notify`),
  resolve: (id: string) => api.patch(`/emergencies/${id}/resolve`),
};

export default api;
