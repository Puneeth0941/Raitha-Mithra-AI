import { useEffect, useState } from "react";
import {
  addFarm,
  updateFarm,
  type Farm,
} from "../../services/farmService";

interface FarmFormProps {
  onClose: () => void;
  onSuccess: () => void;
  farm?: Farm;
}

function FarmForm({ onClose, onSuccess, farm }: FarmFormProps) {
  const [formData, setFormData] = useState({
    farm_name: "",
    area: "",
    total_acres: 0,
    arecanut_trees: 0,
    coconut_trees: 0,
  });

  useEffect(() => {
    if (farm) {
      setFormData({
        farm_name: farm.farm_name,
        area: farm.area,
        total_acres: Number(farm.total_acres),
        arecanut_trees: farm.arecanut_trees,
        coconut_trees: farm.coconut_trees,
      });
    }
  }, [farm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "farm_name" || name === "area"
          ? value
          : value === ""
          ? 0
          : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (farm && farm.id) {
        await updateFarm(farm.id, formData);
        alert("Farm updated successfully!");
      } else {
        await addFarm(formData);
        alert("Farm added successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Operation failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-green-700 mb-8">
          {farm ? "✏ Edit Farm" : "🌾 Add Farm"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block mb-2 font-semibold">
              Farm Name
            </label>

            <input
              type="text"
              name="farm_name"
              value={formData.farm_name}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Area
            </label>

            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Total Acres
            </label>

            <input
              type="number"
              name="total_acres"
              value={formData.total_acres || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Arecanut Trees
            </label>

            <input
              type="number"
              name="arecanut_trees"
              value={formData.arecanut_trees || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Coconut Trees
            </label>

            <input
              type="number"
              name="coconut_trees"
              value={formData.coconut_trees || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {farm ? "Update Farm" : "Save Farm"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default FarmForm;