import type { Income } from "../../services/incomeService";
import type { Farm } from "../../services/farmService";

interface IncomeCardProps {
  income: Income;
  farms: Farm[];
  onEdit: (income: Income) => void;
  onDelete: (id: number) => void;
}

function IncomeCard({
  income,
  farms,
  onEdit,
  onDelete,
}: IncomeCardProps) {
  const farm = farms.find((f) => f.id === income.farm_id);

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">

      <h2 className="text-xl font-bold text-green-700 mb-4">
        🌾 {farm?.farm_name || "Unknown Farm"}
      </h2>

      <div className="space-y-2 text-gray-700">

        <p>
          <span className="font-semibold">💰 Source:</span>{" "}
          {income.source}
        </p>

        <p>
          <span className="font-semibold">₹ Amount:</span>{" "}
          ₹{Number(income.amount).toLocaleString()}
        </p>

        <p>
          <span className="font-semibold">📅 Date:</span>{" "}
          {income.date}
        </p>

        <p>
          <span className="font-semibold">📝 Notes:</span>{" "}
          {income.notes || "-"}
        </p>

      </div>

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() => onEdit(income)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          ✏ Edit
        </button>

        <button
          onClick={() => income.id && onDelete(income.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          🗑 Delete
        </button>

      </div>

    </div>
  );
}

export default IncomeCard;