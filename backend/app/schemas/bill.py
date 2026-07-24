from pydantic import BaseModel
from typing import Optional
from datetime import date as date_type, datetime


class BillResponse(BaseModel):
    id: int
    farm_id: Optional[int] = None
    bill_type: str
    image_url: str
    date: Optional[date_type] = None
    notes: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True