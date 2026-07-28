import { API } from "./authService";

export interface DashboardData {
  total_farms: number;
  total_income: number;
  total_expense: number;
  net_profit: number;
  total_arecanut_trees: number;
  total_coconut_trees: number;
}

export const getDashboardData = async (
  farmId?: number
): Promise<DashboardData> => {
  const params: Record<string, any> = {};

  if (farmId !== undefined && farmId !== null) {
    params.farm_id = farmId;
  }

  const response = await API.get("/dashboard", {
    params,
  });

  return response.data;
};