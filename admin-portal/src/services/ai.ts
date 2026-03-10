import axios from "axios";

const API_BASE_URL = import.meta.env.PROD ? "/api/ai" : "http://localhost:5000/api/ai";

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
    const response = await axios.get(`${API_BASE_URL}/predict`);
    return response.data;
  },

  getDemand: async (): Promise<{ demand: Demand }> => {
    const response = await axios.get(`${API_BASE_URL}/demand`);
    return response.data;
  },

  getAnomalies: async (): Promise<{ anomalies: Anomaly[] }> => {
    const response = await axios.get(`${API_BASE_URL}/anomalies`);
    return response.data;
  },

  trainModel: async (): Promise<{ message?: string; error?: string }> => {
    const response = await axios.post(`${API_BASE_URL}/train`);
    return response.data;
  },

  getStats: async (days: number = 7): Promise<AIStats> => {
    const response = await axios.get(`${API_BASE_URL}/stats`, { params: { days } });
    return response.data;
  },

  getInsights: async (): Promise<AIInsights> => {
    const response = await axios.get(`${API_BASE_URL}/insights`);
    return response.data;
  },

  getTransactions: async (limit: number = 10): Promise<Transaction[]> => {
    const response = await axios.get(`${API_BASE_URL}/transactions`, { params: { limit } });
    return response.data;
  },

  getHistory: async (days: number = 7): Promise<HistoryData[]> => {
    const response = await axios.get(`${API_BASE_URL}/history`, { params: { days } });
    return response.data;
  }
};

export default aiService;
