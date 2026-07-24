from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from app.models.user import User
from app.utils.security import get_current_user
from app.services.ceda_service import (
    get_commodities,
    get_geographies,
    get_markets,
)
from app.services.market_service import MarketService

router = APIRouter(
    prefix="/market",
    tags=["Market"]
)


@router.get("/commodities")
def commodities(current_user: User = Depends(get_current_user)):
    try:
        return get_commodities()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/geographies")
def geographies(current_user: User = Depends(get_current_user)):
    try:
        return get_geographies()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/markets")
def markets(current_user: User = Depends(get_current_user)):
    try:
        data = get_markets()
        return data
    except Exception:
        # Fallback APMCs list if CEDA markets API rate limits or errors
        return {
            "output": {
                "data": [
                    {"id": 1, "name": "Shivamogga APMC"},
                    {"id": 2, "name": "Mangaluru APMC"},
                    {"id": 3, "name": "Udupi APMC"},
                    {"id": 4, "name": "Puttur APMC"},
                    {"id": 5, "name": "Sullia APMC"},
                    {"id": 6, "name": "Sirsi APMC"},
                    {"id": 7, "name": "Channagiri APMC"},
                ]
            }
        }


@router.get("/live-prices")
def live_prices(
    market: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    try:
        return MarketService.get_live_prices(market=market)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions")
def predictions(
    market: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    try:
        return MarketService.get_predictions(market=market)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))