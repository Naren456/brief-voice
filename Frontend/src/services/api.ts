import axios, { AxiosInstance } from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // eslint-disable-next-line no-console
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || "");
  return config;
});

api.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line no-console
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`, response.data);
    return response;
  },
  (err) => {
    // eslint-disable-next-line no-console
    console.error(`[API Error] ${err?.config?.method?.toUpperCase()} ${err?.config?.url}`, err?.message, err?.response?.data);
    return Promise.reject(err);
  },
);
