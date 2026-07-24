from fastapi import APIRouter, Depends
from app.services.weather_service import WeatherService
from app.models.user import User
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


@router.get("/{city}")
def get_weather(
    city: str,
    current_user: User = Depends(get_current_user)
):
    return WeatherService.get_current_weather(city)