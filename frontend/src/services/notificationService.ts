import { API } from "./authService";

const BASE = "/notifications";

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

// Get notifications
export const getNotifications = async (): Promise<NotificationData[]> => {
  const response = await API.get(`${BASE}/`);
  return Array.isArray(response.data) ? response.data : [];
};

// Mark one notification as read
export const markAsRead = async (
  id: number
): Promise<NotificationData> => {
  const response = await API.put(`${BASE}/${id}/read`);
  return response.data;
};

// Mark all as read
export const markAllAsRead = async (): Promise<{ message: string }> => {
  const response = await API.put(`${BASE}/read-all`);
  return response.data;
};

// Delete one notification
export const deleteNotification = async (
  id: number
): Promise<{ message: string }> => {
  const response = await API.delete(`${BASE}/${id}`);
  return response.data;
};

// Clear all notifications
export const clearAllNotifications = async (): Promise<{ message: string }> => {
  const response = await API.delete(`${BASE}/clear-all`);
  return response.data;
};