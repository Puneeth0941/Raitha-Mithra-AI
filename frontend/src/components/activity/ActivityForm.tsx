import { useEffect, useState } from "react";

import type { Activity } from "../../services/activityService";
import type { Farm } from "../../services/farmService";
import { getAllFarms } from "../../services/farmService";

interface ActivityFormProps {
  onSubmit: (activity: Activity) => void;
  initialData?: Activity | null;
  onClose: () => void;
}

export default function ActivityForm({
  onSubmit,
  initialData,
  onClose,
}: ActivityFormProps) {
  const [farms, setFarms] = useState<Farm[]>([]);

  const [formData, setFormData] = useState<Activity>({
    farm_id: 0,
    activity_type: "",
    start_date: "",
    end_date: "",
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    loadFarms();

    if (initialData) {
      setFormData({
        ...initialData,
        end_date: initialData.end_date || "",
      });
    }
  }, [initialData]);

  const loadFarms = async () => {
    try {
      const data = await getAllFarms();
      setFarms(data);
    } catch (error) {
      console.error("Error loading farms:", error);
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
      [name]: name === "farm_id" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.farm_id ||
      !formData.activity_type ||
      !formData.start_date
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-[550px] rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-5">
          {initialData ? "Edit Activity" : "Add Activity"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Farm */}
          <div>
            <label className="block mb-1 font-medium">
              Farm
            </label>

            <select
              name="farm_id"
              value={formData.farm_id}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Select Farm</option>

              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.farm_name}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block mb-1 font-medium">
              Activity Type
            </label>

            <select
              name="activity_type"
              value={formData.activity_type}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Select Activity</option>
              <option value="spraying">Spraying</option>
              <option value="drying">Drying</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block mb-1 font-medium">
                Start Date
              </label>

              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                End Date
              </label>

              <input
                type="date"
                name="end_date"
                value={formData.end_date || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 font-medium">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1 font-medium">
              Notes
            </label>

            <textarea
              name="notes"
              rows={4}
              value={formData.notes || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Enter notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
            >
              {initialData ? "Update" : "Save"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}