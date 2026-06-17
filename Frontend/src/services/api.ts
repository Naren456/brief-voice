import axios, { AxiosInstance } from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // eslint-disable-next-line no-console
    console.warn("[api] request failed", err?.config?.url, err?.message);
    return Promise.reject(err);
  },
);
