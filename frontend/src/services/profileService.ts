import { API } from "./authService";

export interface ProfileData {
  id?: number;
  name: string;
  phone: string;
  village: string;
  profile_photo?: string;
  main_crop?: string;
  farm_area?: string;
}

const BASE = "/profile";

// Get profile
export const getProfile = async (): Promise<ProfileData> => {
  const response = await API.get(`${BASE}/me`);
  return response.data;
};

// Update profile
export const updateProfile = async (
  data: ProfileData
): Promise<ProfileData> => {
  const response = await API.put(`${BASE}/me`, data);
  return response.data;
};

// Upload profile photo
export const uploadProfilePhoto = async (
  file: File
): Promise<{ photo_url: string }> => {
  const formData = new FormData();

  formData.append("photo", file);

  const response = await API.post(`${BASE}/photo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};