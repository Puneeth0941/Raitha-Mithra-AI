import { useEffect, useState } from "react";
import type { Expense } from "../../services/expenseService";
import { getAllFarms } from "../../services/farmService";
import type { Farm } from "../../services/farmService";

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  initialData?: Expense | null;
  onClose: () => void;
}

export default function ExpenseForm({
  onSubmit,
  initialData,
  onClose,
}: ExpenseFormProps) {
  const [farms, setFarms] = useState<Farm[]>([]);

  const [formData, setFormData] = useState<Expense>({
    farm_id: 0,
    expense_type: "",
    amount: 0,
    date: "",
    notes: "",
  });

  useEffect(() => {
    loadFarms();

    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const loadFarms = async () => {
    try {
      const data = await getAllFarms();
      setFarms(data);
    } catch (error) {
      console.error("Failed to load farms", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "farm_id" || name === "amount"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.farm_id ||
      !formData.expense_type ||
      !formData.amount ||
      !formData.date
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-5">
          {initialData ? "Edit Expense" : "Add Expense"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium">
              Select Farm
            </label>

            <select
              name="farm_id"
              value={formData.farm_id}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Choose Farm</option>

              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.farm_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Expense Type
            </label>

            <input
              type="text"
              name="expense_type"
              value={formData.expense_type}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Example: Fertilizer"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded p-2"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {initialData ? "Update" : "Save"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}