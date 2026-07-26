import axios from "axios";

const API_URL = "https://raitha-mithra-backend.onrender.com";

export interface FarmReport {
  farm_name: string;
  total_income: number;
  total_expense: number;
  net_profit: number;
  income_records: number;
  expense_records: number;
  latest_market_price?: number;
  market_grade?: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export interface CropProfitData {
  crop: string;
  profit: number;
}

export interface OverallReport {
  total_income: number;
  total_expense: number;
  annual_profit: number;
  monthly_breakdown: MonthlyData[];
  crop_wise_profit: CropProfitData[];
}

export const getFarmReport = async (farmId: number): Promise<FarmReport> => {
  const response = await axios.get(`${API_URL}/farm/${farmId}`);
  return response.data;
};

export const getOverallReport = async (): Promise<OverallReport> => {
  const response = await axios.get(`${API_URL}/overall`);
  return response.data;
};
