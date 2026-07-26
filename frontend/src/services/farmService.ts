import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export interface Farm {
  id?: number;
  user_id?: number;
  farm_name: string;
  area: string;
  total_acres: number;
  arecanut_trees: number;
  coconut_trees: number;
}

export const getAllFarms = async () => {
  const response = await axios.get(`${API}/all`);
  return response.data;
};

export const addFarm = async (farm: Farm) => {
  const response = await axios.post(`${API}/add`, farm);
  return response.data;
};

export const updateFarm = async (id: number, farm: Farm) => {
  const response = await axios.put(`${API}/update/${id}`, farm);
  return response.data;
};

export const deleteFarm = async (id: number) => {
  const response = await axios.delete(`${API}/delete/${id}`);
  return response.data;
};