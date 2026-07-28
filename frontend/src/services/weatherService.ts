import { API } from "./authService";

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
  const response = await API.get(`/weather/${city}`);
  return response.data;
};