import { API } from "./authService";

export interface Income {
  id?: number;
  farm_id: number;
  source: string;
  amount: number;
  date: string;
  notes?: string;
}

// Get all income
export const getAllIncome = async (): Promise<Income[]> => {
  const response = await API.get("/income/all");
  return response.data;
};

// Add income
export const addIncome = async (income: Income): Promise<Income> => {
  const response = await API.post("/income/add", income);
  return response.data;
};

// Update income
export const updateIncome = async (
  id: number,
  income: Income
): Promise<Income> => {
  const response = await API.put(`/income/update/${id}`, income);
  return response.data;
};

// Delete income
export const deleteIncome = async (id: number) => {
  const response = await API.delete(`/income/delete/${id}`);
  return response.data;
};