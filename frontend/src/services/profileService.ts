import axios from "axios";

const API_URL = "http://127.0.0.1:8000/profile";

export interface ProfileData {
  id?: number;
  name: string;
  phone: string;
  village: string;
  profile_photo?: string;
  main_crop?: string;
  farm_area?: string;
}

export const getProfile = async (): Promise<ProfileData> => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

export const updateProfile = async (data: ProfileData): Promise<ProfileData> => {
  const response = await axios.put(`${API_URL}/me`, data);
  return response.data;
};

export const uploadProfilePhoto = async (file: File): Promise<{ photo_url: string }> => {
  const formData = new FormData();
  formData.append("photo", file);
  const response = await axios.post(`${API_URL}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};
