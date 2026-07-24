import { useEffect, useState } from "react";
import {
  addIncome,
  updateIncome,
  type Income,
} from "../../services/incomeService";
import {
  getAllFarms,
  type Farm,
} from "../../services/farmService";

interface IncomeFormProps {
  onClose: () => void;
  onSuccess: () => void;
  income?: Income;
}

function IncomeForm({
  onClose,
  onSuccess,
  income,
}: IncomeFormProps) {
  const [farms, setFarms] = useState<Farm[]>([]);

  const [formData, setFormData] = useState<Income>({
    farm_id: 0,
    source: "",
    amount: 0,
    date: "",
    notes: "",
  });

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    if (income) {
      setFormData({
        farm_id: income.farm_id,
        source: income.source,
        amount: Number(income.amount),
        date: income.date,
        notes: income.notes || "",
      });
    }
  }, [income]);

  const loadFarms = async () => {
    try {
      const data = await getAllFarms();
      setFarms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "farm_id" || name === "amount"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      if (income?.id) {
        await updateIncome(income.id, formData);
        alert("Income updated successfully!");
      } else {
        await addIncome(formData);
        alert("Income added successfully!");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Operation failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white p-6 rounded-xl w-[500px] shadow-xl">

        <h2 className="text-2xl font-bold text-green-700 mb-5">
          {income ? "✏ Edit Income" : "💰 Add Income"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="font-semibold">
              Farm
            </label>

            <select
              name="farm_id"
              value={formData.farm_id}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            >
              <option value={0}>
                Select Farm
              </option>

              {farms.map((farm) => (
                <option
                  key={farm.id}
                  value={farm.id}
                >
                  {farm.farm_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold">
              Source
            </label>

            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="font-semibold">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="font-semibold">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="font-semibold">
              Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-5 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-5 py-2 rounded-lg"
            >
              {income ? "Update Income" : "Save Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncomeForm;