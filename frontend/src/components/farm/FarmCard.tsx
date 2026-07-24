import type { Farm } from "../../services/farmService";

interface FarmCardProps {
  farm: Farm;
  onEdit: (farm: Farm) => void;
  onDelete: (id: number) => void;
}

function FarmCard({ farm, onEdit, onDelete }: FarmCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">

      <h2 className="text-2xl font-bold text-green-700">
        🌾 {farm.farm_name}
      </h2>

      <div className="mt-4 space-y-2 text-gray-700">
        <p>
          <span className="font-semibold">📍 Area:</span> {farm.area}
        </p>

        <p>
          <span className="font-semibold">🌱 Total Acres:</span>{" "}
          {farm.total_acres}
        </p>

        <p>
          <span className="font-semibold">🌴 Arecanut Trees:</span>{" "}
          {farm.arecanut_trees}
        </p>

        <p>
          <span className="font-semibold">🥥 Coconut Trees:</span>{" "}
          {farm.coconut_trees}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => onEdit(farm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          ✏ Edit
        </button>

        <button
          onClick={() => farm.id && onDelete(farm.id)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          🗑 Delete
        </button>
      </div>

    </div>
  );
}

export default FarmCard;