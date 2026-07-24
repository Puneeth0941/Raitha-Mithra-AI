from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True
    )

    farm_id = Column(
        Integer,
        ForeignKey("farms.id", ondelete="CASCADE"),
        nullable=True
    )

    bill_type = Column(String(50), nullable=False, default="General")

    image_url = Column(String, nullable=False)

    date = Column(Date, nullable=True)

    notes = Column(Text, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())