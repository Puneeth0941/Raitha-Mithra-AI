from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from typing import Optional


class IncomeCreate(BaseModel):
    farm_id: int
    source: str
    amount: Decimal
    date: date
    notes: Optional[str] = None


class IncomeResponse(BaseModel):
    id: int
    farm_id: int
    source: str
    amount: Decimal
    date: date
    notes: Optional[str]

    class Config:
        from_attributes = True