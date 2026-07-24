import type { Expense } from "../../services/expenseService";
import type { Farm } from "../../services/farmService";

interface ExpenseCardProps {
  expense: Expense;
  farms: Farm[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

export default function ExpenseCard({
  expense,
  farms,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const farm = farms.find((f) => f.id === expense.farm_id);

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
      <h2 className="text-xl font-semibold text-green-700 mb-2">
        {expense.expense_type}
      </h2>

      <div className="space-y-1 text-gray-700">
        <p>
          <span className="font-semibold">Farm:</span>{" "}
          {farm?.farm_name || "Unknown Farm"}
        </p>

        <p>
          <span className="font-semibold">Amount:</span> ₹{expense.amount}
        </p>

        <p>
          <span className="font-semibold">Date:</span> {expense.date}
        </p>

        {expense.notes && (
          <p>
            <span className="font-semibold">Notes:</span> {expense.notes}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={() => onEdit(expense)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Edit
        </button>

        <button
          onClick={() => {
            if (expense.id !== undefined) {
              onDelete(expense.id);
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}