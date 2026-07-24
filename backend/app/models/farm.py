from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    farm_name = Column(String, nullable=False)

    area = Column(String, nullable=False)   # Location

    total_acres = Column(Numeric, nullable=False)

    arecanut_trees = Column(Integer, default=0)

    coconut_trees = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())