import { API } from "./authService";

export interface Farm {
  id?: number;
  user_id?: number;
  farm_name: string;
  area: string;
  total_acres: number;
  arecanut_trees: number;
  coconut_trees: number;
}

const BASE = "/farm";

// Get all farms
export const getAllFarms = async () => {
  const response = await API.get(`${BASE}/all`);
  return response.data;
};

// Add farm
export const addFarm = async (farm: Farm) => {
  const response = await API.post(`${BASE}/add`, farm);
  return response.data;
};

// Update farm
export const updateFarm = async (id: number, farm: Farm) => {
  const response = await API.put(`${BASE}/update/${id}`, farm);
  return response.data;
};

// Delete farm
export const deleteFarm = async (id: number) => {
  const response = await API.delete(`${BASE}/delete/${id}`);
  return response.data;
};