// src/services/api.ts
// admin-portal/src/services/api.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

// ----------------- Interfaces -----------------
export interface KPIs {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
}

export interface SaleRow {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

export interface SalesTrend {
  date: string;
  sales: number;
}

export interface Product {
  product_id: string;
  name: string;
  price: number;
  stock?: number;
  category?: string;
  description?: string;
}

export interface NewSale {
  customer: string;
  amount: number;
  products: string[]; // list of product IDs
}

export interface CreateSaleResponse {
  success: boolean;
  invoiceUrl: string; // URL to the generated invoice
}

// ----------------- API Object -----------------
const api = {
  // KPI metrics
  getKPIs: async (): Promise<KPIs> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          revenue: 125000,
          orders: 450,
          products: 85,
          customers: 120,
        });
      }, 800);
    });
  },

  // Sales trend
  getSalesTrend: async (): Promise<SalesTrend[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { date: "Jan", sales: 4000 },
          { date: "Feb", sales: 3000 },
          { date: "Mar", sales: 5000 },
          { date: "Apr", sales: 2780 },
          { date: "May", sales: 1890 },
          { date: "Jun", sales: 2390 },
          { date: "Jul", sales: 3490 },
        ]);
      }, 800);
    });
  },

  // Recent sales table
  getRecentSales: async (): Promise<SaleRow[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: "S001", customer: "Alice Johnson", amount: "$120.50", status: "Paid", date: "2024-02-15" },
          { id: "S002", customer: "Bob Smith", amount: "$85.00", status: "Pending", date: "2024-02-14" },
          { id: "S003", customer: "Charlie Brown", amount: "$320.00", status: "Failed", date: "2024-02-12" },
          { id: "S004", customer: "Diana Prince", amount: "$45.00", status: "Paid", date: "2024-02-10" },
          { id: "S005", customer: "Evan Wright", amount: "$67.20", status: "Paid", date: "2024-02-09" },
        ]);
      }, 800);
    });
  },

  // Product list — real backend
  getProducts: async (): Promise<Product[]> => {
    const res = await instance.get("/products");
    return res.data;
  },

  // Add product — real backend
  addProduct: async (product: { name: string; price: number; stock: number }): Promise<Product> => {
    const res = await instance.post("/products", product);
    return res.data;
  },

  // Create a new sale
  createSale: async (_sale: NewSale): Promise<CreateSaleResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          invoiceUrl: `https://example.com/invoice/${Date.now()}`,
        });
      }, 500);
    });
  },
};

export default api;
