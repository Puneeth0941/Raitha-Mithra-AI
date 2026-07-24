import axios from "axios";

const API = "http://127.0.0.1:8000/income";

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
  const response = await axios.get(`${API}/all`);
  return response.data;
};

// Add income
export const addIncome = async (income: Income): Promise<Income> => {
  const response = await axios.post(`${API}/add`, income);
  return response.data;
};

// Update income
export const updateIncome = async (
  id: number,
  income: Income
): Promise<Income> => {
  const response = await axios.put(`${API}/update/${id}`, income);
  return response.data;
};

// Delete income
export const deleteIncome = async (id: number) => {
  const response = await axios.delete(`${API}/delete/${id}`);
  return response.data;
};