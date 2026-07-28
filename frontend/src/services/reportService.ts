import { API } from "./authService";

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

// Get report for a specific farm
export const getFarmReport = async (
  farmId: number
): Promise<FarmReport> => {
  const response = await API.get(`/report/farm/${farmId}`);
  return response.data;
};

// Get overall report
export const getOverallReport = async (): Promise<OverallReport> => {
  const response = await API.get("/report/overall");
  return response.data;
};