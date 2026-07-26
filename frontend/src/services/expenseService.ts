import axios from "axios";

const API = "https://raitha-mithra-backend.onrender.com";

export interface Expense {
  id?: number;
  farm_id: number;
  expense_type: string;
  amount: number;
  date: string;
  notes?: string;
}

// Get all expenses
export const getAllExpenses = async (): Promise<Expense[]> => {
  const response = await axios.get(`${API}/all`);
  return response.data;
};

// Add expense
export const addExpense = async (
  expense: Expense
): Promise<Expense> => {
  const response = await axios.post(`${API}/add`, expense);
  return response.data;
};

// Update expense
export const updateExpense = async (
  id: number,
  expense: Expense
): Promise<Expense> => {
  const response = await axios.put(`${API}/update/${id}`, expense);
  return response.data;
};

// Delete expense
export const deleteExpense = async (
  id: number
): Promise<void> => {
  await axios.delete(`${API}/delete/${id}`);
};