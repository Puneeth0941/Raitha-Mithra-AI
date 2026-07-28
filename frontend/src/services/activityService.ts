import { API } from "./authService";

export interface Activity {
  id?: number;
  farm_id: number;
  activity_type: string;
  start_date: string;
  end_date?: string;
  status: string;
  notes?: string;
}

// Get All Activities
export const getAllActivities = async (): Promise<Activity[]> => {
  const response = await API.get("/activity/all");
  return response.data;
};

// Add Activity
export const addActivity = async (
  activity: Activity
): Promise<Activity> => {
  const response = await API.post("/activity/add", activity);
  return response.data;
};

// Update Activity
export const updateActivity = async (
  id: number,
  activity: Activity
): Promise<Activity> => {
  const response = await API.put(`/activity/update/${id}`, activity);
  return response.data;
};

// Delete Activity
export const deleteActivity = async (id: number): Promise<void> => {
  await API.delete(`/activity/delete/${id}`);
};