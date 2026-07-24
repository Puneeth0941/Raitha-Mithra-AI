from pydantic import BaseModel
from decimal import Decimal


class DashboardResponse(BaseModel):
    total_farms: int
    total_income: Decimal
    total_expense: Decimal
    net_profit: Decimal
    total_arecanut_trees: int
    total_coconut_trees: int