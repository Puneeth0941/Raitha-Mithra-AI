from pydantic import BaseModel
from decimal import Decimal


class FarmCreate(BaseModel):
    farm_name: str
    area: str
    total_acres: Decimal
    arecanut_trees: int
    coconut_trees: int


class FarmResponse(BaseModel):
    id: int
    user_id: int
    farm_name: str
    area: str
    total_acres: Decimal
    arecanut_trees: int
    coconut_trees: int

    class Config:
        from_attributes = True