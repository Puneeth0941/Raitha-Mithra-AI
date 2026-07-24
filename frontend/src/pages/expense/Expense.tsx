import { useEffect, useState } from "react";

import type { Expense } from "../../services/expenseService";
import {
  getAllExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../../services/expenseService";

import type { Farm } from "../../services/farmService";
import { getAllFarms } from "../../services/farmService";

import ExpenseCard from "../../components/expense/ExpenseCard";
import ExpenseForm from "../../components/expense/ExpenseForm";

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const expenseData = await getAllExpenses();
      const farmData = await getAllFarms();

      setExpenses(expenseData);
      setFarms(farmData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async (expense: Expense) => {
    try {
      if (selectedExpense?.id) {
        await updateExpense(selectedExpense.id, expense);
      } else {
        await addExpense(expense);
      }

      setShowForm(false);
      setSelectedExpense(null);
      loadData();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    try {
      await deleteExpense(id);
      loadData();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          Expense Management
        </h1>

        <button
          onClick={() => {
            setSelectedExpense(null);
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Expense
        </button>
      </div>

      {showForm && (
        <ExpenseForm
          initialData={selectedExpense}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedExpense(null);
          }}
        />
      )}

      {expenses.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No expenses found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              farms={farms}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}