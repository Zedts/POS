import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://172.11.7.76:3000/api";

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

// Categories API
export const getCategoriesListAPI = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getCategoryByIdAPI = async (id: number) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createCategoryAPI = async (categoryData: any) => {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateCategoryAPI = async (id: number, categoryData: any) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const deleteCategoryAPI = async (id: number) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getCategoryStatsAPI = async () => {
  try {
    const response = await api.get("/categories/stats");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getProductsByCategoryAPI = async (id: number) => {
  try {
    const response = await api.get(`/categories/${id}/products`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Discounts API
export const getDiscountsAPI = async () => {
  try {
    const response = await api.get("/discounts");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getDiscountByIdAPI = async (id: number) => {
  try {
    const response = await api.get(`/discounts/${id}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDiscountAPI = async (discountData: any) => {
  try {
    const response = await api.post("/discounts", discountData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateDiscountAPI = async (id: number, discountData: any) => {
  try {
    const response = await api.put(`/discounts/${id}`, discountData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const deleteDiscountAPI = async (id: number) => {
  try {
    const response = await api.delete(`/discounts/${id}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getDiscountStatsAPI = async () => {
  try {
    const response = await api.get("/discounts/stats");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const validateDiscountCodeAPI = async (code: string, amount: number) => {
  try {
    const response = await api.post("/discounts/validate", { code, amount });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Orders API
export const getOrdersAPI = async (filters?: { startDate?: string; endDate?: string; employeeName?: string; status?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.employeeName) params.append('employeeName', filters.employeeName);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getOrderByNumberAPI = async (orderNumber: string) => {
  try {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getOrderStatsAPI = async () => {
  try {
    const response = await api.get("/orders/stats");
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const updateOrderStatusAPI = async (orderNumber: string, status: string) => {
  try {
    const response = await api.put(`/orders/${orderNumber}/status`, { status });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Create new order
export const createOrderAPI = async (orderData: {
  employeeId: number;
  orderTotal: number;
  balance: number;
  discountCode?: string;
}, orderItems: Array<{
  productId: number;
  productName: string;
  productPicture: string;
  qty: number;
  price: number;
}>) => {
  try {
    const response = await api.post('/orders', { orderData, orderItems });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Invoices API
export const getInvoicesAPI = async (filters?: { startDate?: string; endDate?: string; invoiceNumber?: string; status?: string; paidBy?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.invoiceNumber) params.append('invoiceNumber', filters.invoiceNumber);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paidBy) params.append('paidBy', filters.paidBy);
    
    const response = await api.get(`/invoices${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getInvoiceByNumberAPI = async (invoiceNumber: string) => {
  try {
    const response = await api.get(`/invoices/${invoiceNumber}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getInvoiceStatsAPI = async () => {
  try {
    const response = await api.get('/invoices/stats');
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Create new invoice
export const createInvoiceAPI = async (invoiceData: {
  orderNumber: string;
  orderTotal: number;
  discountCode?: string;
  discountPercent?: number;
  balance: number;
  paidBy: string;
  verifiedBy: number;
  mobileEmployee?: string;
}) => {
  try {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Student API
export const getStudentsAPI = async (filters?: { class?: string; major?: string; status?: string; search?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.class) params.append('class', filters.class);
    if (filters?.major) params.append('major', filters.major);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get(`/students?${params.toString()}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getStudentByIdAPI = async (id: number) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getStudentTransactionsAPI = async (id: number) => {
  try {
    const response = await api.get(`/students/${id}/transactions`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const getStudentStatsAPI = async () => {
  try {
    const response = await api.get('/students/stats');
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateStudentAPI = async (id: number, studentData: any) => {
  try {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

export const toggleStudentStatusAPI = async (id: number) => {
  try {
    const response = await api.patch(`/students/${id}/toggle-status`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Terjadi kesalahan koneksi" };
  }
};

// Reports API
export const getSalesReportAPI = async (startDate: string, endDate: string) => {
  try {
    const response = await api.get('/reports/sales', {
      params: { startDate, endDate }
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch sales report" };
  }
};

export const getTopProductsAPI = async (startDate: string, endDate: string) => {
  try {
    const response = await api.get('/reports/top-products', {
      params: { startDate, endDate }
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch top products" };
  }
};

export const getDiscountUsageAPI = async (startDate: string, endDate: string) => {
  try {
    const response = await api.get('/reports/discount-usage', {
      params: { startDate, endDate }
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch discount usage" };
  }
};

export const getStockStatusAPI = async () => {
  try {
    const response = await api.get('/reports/stock-status');
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch stock status" };
  }
};

export const getStudentRevenueByClassAPI = async (startDate: string, endDate: string) => {
  try {
    const response = await api.get('/reports/student-revenue/class', {
      params: { startDate, endDate }
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch student revenue by class" };
  }
};

export const getStudentRevenueByMajorAPI = async (startDate: string, endDate: string) => {
  try {
    const response = await api.get('/reports/student-revenue/major', {
      params: { startDate, endDate }
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch student revenue by major" };
  }
};

// Price History API
export const getAllProductsWithPriceHistoryAPI = async (filters?: { search?: string; categoryId?: number; startDate?: string; endDate?: string }) => {
  try {
    const response = await api.get('/price-history/products', {
      params: filters
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch products with price history" };
  }
};

export const getPriceHistoryByProductAPI = async (id: number) => {
  try {
    const response = await api.get(`/price-history/product/${id}`);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch price history" };
  }
};

// Audit Logs API
export const getAuditLogsAPI = async (filters?: {
  userType?: string;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get('/audit-logs', {
      params: filters
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to fetch audit logs" };
  }
};

// Settings API
export const getAdminProfileAPI = async () => {
  try {
    const response = await api.get('/settings/profile');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { success: false, message: "Failed to fetch admin profile" };
  }
};

export const updateAdminProfileAPI = async (profileData: {
  username: string;
  fullName: string;
  currentPassword?: string;
  newPassword?: string;
}) => {
  try {
    const response = await api.put('/settings/profile', profileData);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { success: false, message: "Failed to update profile" };
  }
};

export const downloadBackupAPI = async () => {
  try {
    const response = await api.get('/settings/backup', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { success: false, message: "Failed to download backup" };
  }
};

export const resetDatabaseAPI = async () => {
  try {
    const response = await api.post('/settings/reset');
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { success: false, message: "Failed to reset database" };
  }
};

export const restoreDatabaseAPI = async (sqlContent: string) => {
  try {
    const response = await api.post('/settings/restore', { sqlContent });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { success: false, message: "Failed to restore database" };
  }
};

export default api;
