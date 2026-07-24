import os
import requests
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

class WeatherService:
    @staticmethod
    def get_current_weather(city: str) -> dict:
        if not API_KEY:
            raise HTTPException(status_code=500, detail="Weather API Key not configured")
        
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="City not found")
            
            data = response.json()
            return {
                "city": data.get("name"),
                "temperature": data.get("main", {}).get("temp"),
                "humidity": data.get("main", {}).get("humidity"),
                "weather": data.get("weather", [{}])[0].get("main"),
                "wind_speed": data.get("wind", {}).get("speed")
            }
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")

    @staticmethod
    def get_weather_forecast(city: str) -> dict:
        if not API_KEY:
            raise HTTPException(status_code=500, detail="Weather API Key not configured")
        
        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Unable to fetch weather forecast")
            
            return response.json()
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=503, detail=f"Weather service forecast unavailable: {str(e)}")
