from sqlalchemy import Column, Integer, String, Numeric, Date, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True
    )

    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)

    expense_type = Column(String, nullable=False)

    amount = Column(Numeric, nullable=False)

    date = Column(Date, nullable=False)

    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())