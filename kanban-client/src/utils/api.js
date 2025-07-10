import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Board API functions
export const boardAPI = {
  getAll: () => api.get("/api/boards"),
  create: (title) => api.post("/api/boards", { title }),
  getById: (id) => api.get(`/api/boards/${id}`),
  update: (id, data) => api.put(`/api/boards/${id}`, data),
  delete: (id) => api.delete(`/api/boards/${id}`),
};

// List API functions
export const listAPI = {
  getByBoard: (boardId) => api.get(`/api/lists/board/${boardId}`),
  create: (title, boardId) => api.post("/api/lists", { title, boardId }),
  update: (id, data) => api.put(`/api/lists/${id}`, data),
  delete: (id) => api.delete(`/api/lists/${id}`),
};

// Card API functions
export const cardAPI = {
  getByList: (listId) => api.get(`/api/cards/list/${listId}`),
  create: (data) => api.post("/api/cards", data),
  update: (id, data) => api.put(`/api/cards/${id}`, data),
  delete: (id) => api.delete(`/api/cards/${id}`),
};

// Auth API functions
export const authAPI = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  register: (name, email, password) =>
    api.post("/api/auth/register", { name, email, password }),
};

export default api;
