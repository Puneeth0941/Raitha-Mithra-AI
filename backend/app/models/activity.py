from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True
    )

    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)

    activity_type = Column(String, nullable=False)

    start_date = Column(Date, nullable=False)

    end_date = Column(Date)

    status = Column(String, default="pending")

    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())