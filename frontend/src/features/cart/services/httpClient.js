import axios from "axios";

export const httpClient = axios.create({
  baseURL: "http://localhost:8083"
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
