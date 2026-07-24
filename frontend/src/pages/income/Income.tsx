import { useEffect, useState } from "react";
import {
  getAllIncome,
  deleteIncome,
  type Income,
} from "../../services/incomeService";

import {
  getAllFarms,
  type Farm,
} from "../../services/farmService";

import IncomeCard from "../../components/income/IncomeCard";
import IncomeForm from "../../components/income/IncomeForm";

function IncomePage() {
  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedIncome, setSelectedIncome] =
    useState<Income | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incomeData, farmData] = await Promise.all([
        getAllIncome(),
        getAllFarms(),
      ]);

      setIncomeList(incomeData);
      setFarms(farmData);
    } catch (error) {
      console.error("Error loading income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = () => {
    setSelectedIncome(null);
    setShowForm(true);
  };

  const handleEdit = (income: Income) => {
    setSelectedIncome(income);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this income?"
    );

    if (!confirmDelete) return;

    try {
      await deleteIncome(id);
      alert("Income deleted successfully!");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete income.");
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedIncome(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <h2 className="text-2xl font-semibold text-green-700">
          Loading Income...
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold text-green-700">
          💰 Income
        </h1>

        <button
          onClick={handleAddIncome}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
        >
          + Add Income
        </button>

      </div>

      {/* Empty State */}
      {incomeList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">

          <h2 className="text-xl font-semibold text-gray-700">
            No income records found
          </h2>

          <p className="text-gray-500 mt-2">
            Click "Add Income" to create your first record.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {incomeList.map((income) => (
            <IncomeCard
              key={income.id}
              income={income}
              farms={farms}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

        </div>
      )}

      {/* Popup */}
      {showForm && (
        <IncomeForm
          income={selectedIncome ?? undefined}
          onClose={handleClose}
          onSuccess={loadData}
        />
      )}

    </div>
  );
}

export default IncomePage;