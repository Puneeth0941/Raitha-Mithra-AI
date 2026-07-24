import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://api.ceda.ashoka.edu.in/v1"
API_KEY = os.getenv("CEDA_API_KEY")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json"
}


def get_commodities():
    response = requests.get(
        f"{BASE_URL}/agmarknet/commodities",
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()


def get_geographies():
    response = requests.get(
        f"{BASE_URL}/agmarknet/geographies",
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()


def get_markets():
    response = requests.get(
        f"{BASE_URL}/agmarknet/markets",
        headers=HEADERS
    )
    response.raise_for_status()
    return response.json()


def get_prices(
    commodity_id: int,
    state_id: int,
    district_ids: list[int],
    market_ids: list[int],
    from_date: str,
    to_date: str,
):
    payload = {
        "commodity_id": commodity_id,
        "state_id": state_id,
        "district_id": district_ids,
        "market_id": market_ids,
        "from_date": from_date,
        "to_date": to_date,
    }

    response = requests.post(
        f"{BASE_URL}/agmarknet/prices",
        headers=HEADERS,
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()