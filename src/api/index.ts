import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://172.11.13.240:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login API
export const loginAPI = async (username: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Register API (Student only)
export const registerAPI = async (studentData: {
  nisn: string;
  username: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  studentClass: string;
  major: string;
}) => {
  try {
    const response = await api.post("/auth/register", studentData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Dashboard API
export const getDashboardDataAPI = async () => {
  try {
    const response = await api.get("/dashboard/data");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export default api;
