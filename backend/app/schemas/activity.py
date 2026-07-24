from pydantic import BaseModel
from datetime import date
from typing import Optional


class ActivityCreate(BaseModel):
    farm_id: int
    activity_type: str
    start_date: date
    end_date: Optional[date] = None
    status: str = "pending"
    notes: Optional[str] = None


class ActivityResponse(BaseModel):
    id: int
    farm_id: int
    activity_type: str
    start_date: date
    end_date: Optional[date]
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True