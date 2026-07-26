import axios from "axios";

const API_URL = "https://raitha-mithra-backend.onrender.com";

export interface NotificationData {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async (): Promise<NotificationData[]> => {
  const response = await axios.get(`${API_URL}/`);
  return response.data;
};

export const markAsRead = async (id: number): Promise<NotificationData> => {
  const response = await axios.put(`${API_URL}/${id}/read`);
  return response.data;
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
  const response = await axios.put(`${API_URL}/read-all`);
  return response.data;
};

export const deleteNotification = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const clearAllNotifications = async (): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/clear-all`);
  return response.data;
};
