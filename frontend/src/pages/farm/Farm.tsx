import { useEffect, useState } from "react";
import {
  getAllFarms,
  deleteFarm,
  type Farm,
} from "../../services/farmService";

import FarmForm from "../../components/farm/FarmForm";
import FarmCard from "../../components/farm/FarmCard";

function FarmPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const data = await getAllFarms();
      setFarms(data);
    } catch (error) {
      console.error("Error loading farms:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add Farm
  const handleAddFarm = () => {
    setSelectedFarm(null);
    setShowForm(true);
  };

  // Edit Farm
  const handleEdit = (farm: Farm) => {
    setSelectedFarm(farm);
    setShowForm(true);
  };

  // Delete Farm
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this farm?"
    );

    if (!confirmDelete) return;

    try {
      await deleteFarm(id);
      alert("Farm deleted successfully!");
      loadFarms();
    } catch (error) {
      console.error(error);
      alert("Failed to delete farm.");
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedFarm(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <h2 className="text-2xl font-semibold text-green-700">
          Loading farms...
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-700">
          🌾 My Farms
        </h1>

        <button
          onClick={handleAddFarm}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          + Add Farm
        </button>
      </div>

      {/* Farm List */}
      {farms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            No farms found
          </h2>

          <p className="text-gray-500 mt-2">
            Click "Add Farm" to create your first farm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Popup */}
      {showForm && (
        <FarmForm
          farm={selectedFarm ?? undefined}
          onClose={handleClose}
          onSuccess={loadFarms}
        />
      )}

    </div>
  );
}

export default FarmPage;