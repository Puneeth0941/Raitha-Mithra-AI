from pydantic import BaseModel
from typing import List, Optional


class Recommendation(BaseModel):
    activity: str
    status: str
    message: str


class WeatherInfo(BaseModel):
    temperature: float
    humidity: int
    weather: str
    wind_speed: float


class AIResponse(BaseModel):
    farm_name: str
    area: str
    weather: WeatherInfo
    recommendations: List[Recommendation]


class SprayRecommendation(BaseModel):
    status: str
    message: str
    reason: str


class DryingRecommendation(BaseModel):
    status: str
    message: str
    alternative_message: Optional[str] = None
    reason: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool


class RainAlert(BaseModel):
    status: str
    message: str


class SellWaitRecommendation(BaseModel):
    decision: str
    title: str
    reason: str


class WeatherRecommendationResponse(BaseModel):
    farm_id: int
    farm_name: str
    area: str
    has_arecanut: bool
    spray_recommendation: SprayRecommendation
    drying_recommendation: DryingRecommendation
    rain_alert: RainAlert
    sell_wait_recommendation: Optional[SellWaitRecommendation] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    answer: str
    source: Optional[str] = None