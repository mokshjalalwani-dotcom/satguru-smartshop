import axios from "axios";

const API_BASE_URL = "/api/ai";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface Prediction {
  date: string;
  predicted_sales: number;
}

export interface Demand {
  [product: string]: number;
}

export interface Anomaly {
    date: string;
    product: string;
    sales: number;
    price: number;
    anomaly: number;
    reason?: string;
    severity?: 'WARNING' | 'CRITICAL';
}

export interface AIStats {
  revenue: number;
  orders: number;
  aov: number;
  active_customers: number;
  low_stock_count: number;
  profit: number;
}

export interface ProductStat {
  name: string;
  sales: number;
  revenue: number;
  profit: number;
  trend: string;
}

export interface AIInsights {
  forecasting: string;
  demand: string;
  anomalies: string;
  bi: string;
  kpi_trends: string;
}

export interface Transaction {
  order_id: string;
  date: string;
  customer_id: string;
  product: string;
  sales: number;
  price: number;
  payment_status: string;
}

export interface HistoryData {
  name: string;
  revenue: number;
}

export const aiService = {
  getPrediction: async (): Promise<{ predictions: Prediction[] }> => {
    const response = await instance.get("/predict");
    return response.data;
  },

  getDemand: async (): Promise<{ demand: Demand }> => {
    const response = await instance.get("/demand");
    return response.data;
  },

  getAnomalies: async (): Promise<{ anomalies: Anomaly[] }> => {
    const response = await instance.get("/anomalies");
    return response.data;
  },

  trainModel: async (): Promise<{ message?: string; error?: string }> => {
    const response = await instance.post("/train");
    return response.data;
  },

  getStats: async (days: number = 7): Promise<AIStats> => {
    const response = await instance.get("/stats", { params: { days } });
    return response.data;
  },

  getInsights: async (): Promise<AIInsights> => {
    const response = await instance.get("/insights");
    return response.data;
  },

  getTransactions: async (limit: number = 10): Promise<Transaction[]> => {
    const response = await instance.get("/transactions", { params: { limit } });
    return response.data;
  },

  getHistory: async (days: number = 7): Promise<HistoryData[]> => {
    const response = await instance.get("/history", { params: { days } });
    return response.data;
  },
  
  getProductStats: async (days: number = 7): Promise<ProductStat[]> => {
    const response = await instance.get("/product-stats", { params: { days } });
    return response.data;
  }
};

export default aiService;
