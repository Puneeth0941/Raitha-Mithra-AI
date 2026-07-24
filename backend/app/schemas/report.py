from pydantic import BaseModel


class ReportResponse(BaseModel):
    farm_name: str
    total_income: float
    total_expense: float
    net_profit: float
    income_records: int
    expense_records: int
    latest_market_price: float | None
    market_grade: str | None