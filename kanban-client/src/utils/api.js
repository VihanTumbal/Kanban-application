import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Board API functions
export const boardAPI = {
  getAll: () => api.get("/api/boards"),
  create: (data) => api.post("/api/boards", data),
  getById: (id) => api.get(`/api/boards/${id}`),
  update: (id, data) => api.patch(`/api/boards/${id}`, data),
  delete: (id) => api.delete(`/api/boards/${id}`),
};

// List API functions
export const listAPI = {
  getByBoard: (boardId) => api.get(`/api/lists/board/${boardId}`),
  create: (title, boardId) => api.post("/api/lists", { title, boardId }),
  update: (id, data) => api.patch(`/api/lists/${id}`, data),
  delete: (id) => api.delete(`/api/lists/${id}`),
};

// Card API functions
export const cardAPI = {
  getByList: (listId) => api.get(`/api/cards/list/${listId}`),
  create: (data) => api.post("/api/cards", data),
  update: (id, data) => api.patch(`/api/cards/${id}`, data),
  delete: (id) => api.delete(`/api/cards/${id}`),
};

// Auth API functions
export const authAPI = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  register: (name, email, password) =>
    api.post("/api/auth/register", { name, email, password }),
};

export default api;
