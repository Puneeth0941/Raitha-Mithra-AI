import axios from "axios";

const API_URL = "https://raitha-mithra-backend.onrender.com";

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  weather: string;
  wind_speed: number;
}

export const getWeather = async (
  city: string
): Promise<WeatherData> => {
  const response = await axios.get(`${API_URL}/${city}`);
  return response.data;
};