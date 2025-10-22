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

// Products API
export const getProductsAPI = async (categoryId?: number) => {
  try {
    const params = categoryId ? { categoryId } : {};
    const response = await api.get("/products", { params });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getProductByIdAPI = async (id: number) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProductAPI = async (productData: any) => {
  try {
    const response = await api.post("/products", productData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateProductAPI = async (id: number, productData: any) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const deleteProductAPI = async (id: number) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getCategoriesAPI = async () => {
  try {
    const response = await api.get("/products/categories");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getLowStockProductsAPI = async (threshold?: number) => {
  try {
    const params = threshold ? { threshold } : {};
    const response = await api.get("/products/low-stock", { params });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getExpiredProductsAPI = async () => {
  try {
    const response = await api.get("/products/expired");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getPriceHistoryAPI = async (id: number) => {
  try {
    const response = await api.get(`/products/${id}/price-history`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const uploadImageAPI = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post("/products/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export default api;
