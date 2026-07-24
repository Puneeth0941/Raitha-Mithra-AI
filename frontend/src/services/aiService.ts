import axios from "axios";

const API_URL = "http://127.0.0.1:8000/ai";

export interface SprayRecommendation {
  status: string;
  message: string;
  reason: string;
}

export interface DryingRecommendation {
  status: string;
  message: string;
  alternative_message?: string;
  reason: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface RainAlert {
  status: string;
  message: string;
}

export interface SellWaitRecommendation {
  decision: string;
  title: string;
  reason: string;
}

export interface WeatherRecommendationResponse {
  farm_id: number;
  farm_name: string;
  area: string;
  has_arecanut: boolean;
  spray_recommendation: SprayRecommendation;
  drying_recommendation: DryingRecommendation;
  rain_alert: RainAlert;
  sell_wait_recommendation?: SellWaitRecommendation;
}

export const getWeatherRecommendations = async (
  farmId: number,
  dryingStartDate?: string
): Promise<WeatherRecommendationResponse> => {
  const params: Record<string, any> = { farm_id: farmId };
  if (dryingStartDate) {
    params.drying_start_date = dryingStartDate;
  }
  const response = await axios.get(`${API_URL}/weather-recommendations`, { params });
  return response.data;
};

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  source?: string;
}

export const sendChatMessage = async (
  question: string,
  history: ChatMessage[] = []
): Promise<{ answer: string; source?: string }> => {
  const response = await axios.post(`${API_URL}/chat`, {
    question,
    history
  });
  return response.data;
};

