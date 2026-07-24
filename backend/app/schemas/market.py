from fastapi import APIRouter, HTTPException, Query
from dotenv import load_dotenv
import os
import requests

load_dotenv()

router = APIRouter(
    prefix="/market",
    tags=["Market Prices"]
)

API_KEY = os.getenv("DATA_GOV_API_KEY")

BASE_URL = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"


@router.get("/")
def get_market_prices(
    state: str = Query(...),
    district: str = Query(...),
    commodity: str = Query(...)
):
    params = {
        "api-key": API_KEY,
        "format": "json",
        "offset": 0,
        "limit": 10,
        "filters[State]": state,
        "filters[District]": district,
        "filters[Commodity]": commodity,
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=20)
        response.raise_for_status()

        return response.json()

    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch market prices: {str(e)}"
        )