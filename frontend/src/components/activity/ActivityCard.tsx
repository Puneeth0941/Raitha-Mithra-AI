import type { Activity } from "../../services/activityService";
import type { Farm } from "../../services/farmService";

interface ActivityCardProps {
  activity: Activity;
  farms: Farm[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
}

export default function ActivityCard({
  activity,
  farms,
  onEdit,
  onDelete,
}: ActivityCardProps) {
  const farm = farms.find((f) => f.id === activity.farm_id);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in progress":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-semibold text-green-700">
          {activity.activity_type}
        </h2>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            activity.status
          )}`}
        >
          {activity.status}
        </span>
      </div>

      <div className="space-y-2 text-gray-700">

        <p>
          <span className="font-semibold">Farm:</span>{" "}
          {farm?.farm_name || "Unknown Farm"}
        </p>

        <p>
          <span className="font-semibold">Start Date:</span>{" "}
          {activity.start_date}
        </p>

        <p>
          <span className="font-semibold">End Date:</span>{" "}
          {activity.end_date || "-"}
        </p>

        {activity.notes && (
          <p>
            <span className="font-semibold">Notes:</span>{" "}
            {activity.notes}
          </p>
        )}

      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={() => onEdit(activity)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Edit
        </button>

        <button
          onClick={() => activity.id && onDelete(activity.id)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  );
}