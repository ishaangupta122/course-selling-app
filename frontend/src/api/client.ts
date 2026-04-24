import axios from "axios";
import { API_URL } from "../config";
import { getSubdomain } from "../utils/subdomainHelper";

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const subdomain = getSubdomain();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (subdomain) {
    config.headers["X-Tenant-Subdomain"] = subdomain;
  }

  return config;
});
