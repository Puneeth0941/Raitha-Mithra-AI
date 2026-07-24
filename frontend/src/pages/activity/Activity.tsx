import { useEffect, useState } from "react";

import type { Activity } from "../../services/activityService";
import {
  getAllActivities,
  addActivity,
  updateActivity,
  deleteActivity,
} from "../../services/activityService";

import type { Farm } from "../../services/farmService";
import { getAllFarms } from "../../services/farmService";

import ActivityCard from "../../components/activity/ActivityCard";
import ActivityForm from "../../components/activity/ActivityForm";

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [activityData, farmData] = await Promise.all([
        getAllActivities(),
        getAllFarms(),
      ]);

      setActivities(activityData);
      setFarms(farmData);
    } catch (error) {
      console.error("Error loading activities:", error);
      alert("Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (activity: Activity) => {
    try {
      if (selectedActivity?.id) {
        await updateActivity(selectedActivity.id, activity);
        alert("Activity updated successfully!");
      } else {
        await addActivity(activity);
        alert("Activity added successfully!");
      }

      setShowForm(false);
      setSelectedActivity(null);

      await loadData();
    } catch (error: any) {
      console.error("Error saving activity:", error);

      if (error.response) {
        console.error(error.response.data);
        alert(
          error.response.data.detail ||
            "Backend rejected the request."
        );
      } else {
        alert("Something went wrong while saving the activity.");
      }
    }
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmDelete) return;

    try {
      await deleteActivity(id);
      alert("Activity deleted successfully!");
      await loadData();
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          Activity Management
        </h1>

        <button
          onClick={() => {
            setSelectedActivity(null);
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Activity
        </button>
      </div>

      {showForm && (
        <ActivityForm
          initialData={selectedActivity}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedActivity(null);
          }}
        />
      )}

      {loading ? (
        <div className="text-center mt-10 text-gray-500">
          Loading activities...
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No activities found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
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