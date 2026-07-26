import axios from "axios";

const API_URL = "https://raitha-mithra-backend.onrender.com";

export interface HistoricalPrice {
  date: string;
  price: number;
}

export interface CommodityPriceInfo {
  commodity: string;
  current_price: number;
  min_price: number;
  max_price: number;
  market: string;
  date: string;
  updated_time: string;
  history: HistoricalPrice[];
}

export interface LivePricesResponse {
  arecanut: CommodityPriceInfo;
  coconut: CommodityPriceInfo;
}

export const getLiveMarketPrices = async (market?: string): Promise<LivePricesResponse> => {
  const response = await axios.get(`${API_URL}/live-prices`, {
    params: market ? { market } : {},
  });
  return response.data;
};

export interface MarketItem {
  id: number;
  name: string;
}

export const getMarketsList = async (): Promise<string[]> => {
  const defaultMarkets = [
    "Shivamogga APMC",
    "Mangaluru APMC",
    "Udupi APMC",
    "Puttur APMC",
    "Sullia APMC",
    "Sirsi APMC",
    "Channagiri APMC",
  ];
  try {
    const response = await axios.get(`${API_URL}/markets`);
    const rawData = response.data?.output?.data || response.data;
    if (Array.isArray(rawData) && rawData.length > 0) {
      const apiMarkets = rawData
        .map((m: any) => (typeof m === "string" ? m : m.name || m.market_name))
        .filter(Boolean);
      // Combine with required APMCs, removing duplicates
      const set = new Set([...defaultMarkets, ...apiMarkets]);
      return Array.from(set);
    }
  } catch (err) {
    console.error("Error fetching markets list from backend:", err);
  }
  return defaultMarkets;
};

export interface PredictionDetail {
  price: number;
  trend: string;
  confidence: string;
  confidence_percentage: number;
}

export interface PredictionForecasts {
  tomorrow: PredictionDetail;
  next_week: PredictionDetail;
  next_month: PredictionDetail;
}

export interface CommodityPredictionInfo {
  commodity: string;
  current_price: number;
  min_price: number;
  max_price: number;
  market: string;
  date: string;
  updated_time: string;
  history: HistoricalPrice[];
  predictions: PredictionForecasts;
  sell_wait_recommendation?: {
    decision: string;
    reason: string;
  };
}

export interface MarketPredictionsResponse {
  arecanut: CommodityPredictionInfo;
  coconut: CommodityPredictionInfo;
}

export const getMarketPredictions = async (market?: string): Promise<MarketPredictionsResponse> => {
  const response = await axios.get(`${API_URL}/predictions`, {
    params: market ? { market } : {},
  });
  return response.data;
};
