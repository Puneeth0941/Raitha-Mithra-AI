import axios from "axios";

const API = "https://raitha-mithra-backend.onrender.com";

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
  const response = await axios.get(`${API}/all`);
  return response.data;
};

// Add Activity
export const addActivity = async (
  activity: Activity
): Promise<Activity> => {
  const response = await axios.post(`${API}/add`, activity);
  return response.data;
};

// Update Activity
export const updateActivity = async (
  id: number,
  activity: Activity
): Promise<Activity> => {
  const response = await axios.put(`${API}/update/${id}`, activity);
  return response.data;
};

// Delete Activity
export const deleteActivity = async (id: number): Promise<void> => {
  await axios.delete(`${API}/delete/${id}`);
};