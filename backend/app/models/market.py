from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime
from sqlalchemy.sql import func
from app.database import Base


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)

    commodity = Column(String, nullable=False)
    market = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)

    min_price = Column(Numeric(10, 2), nullable=False)
    modal_price = Column(Numeric(10, 2), nullable=False)
    max_price = Column(Numeric(10, 2), nullable=False)

    date = Column(Date, nullable=False)

    source = Column(String, default="APMC")

    created_at = Column(DateTime(timezone=True), server_default=func.now())