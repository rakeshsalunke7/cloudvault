import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const TOKEN_KEY = 'cloudvault_token';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Redirect to login if not already there
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/oauth-success') && !window.location.pathname.startsWith('/shared/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
