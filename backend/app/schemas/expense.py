from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from typing import Optional


class ExpenseCreate(BaseModel):
    farm_id: int
    expense_type: str
    amount: Decimal
    date: date
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    farm_id: int
    expense_type: str
    amount: Decimal
    date: date
    notes: Optional[str]

    class Config:
        from_attributes = True