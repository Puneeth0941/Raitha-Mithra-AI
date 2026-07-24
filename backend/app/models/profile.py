from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    name = Column(String, nullable=False)
    phone = Column(String(20), nullable=False)
    village = Column(String, nullable=False)
    profile_photo = Column(String, nullable=True)
    main_crop = Column(String, nullable=True, default="Arecanut")
    farm_area = Column(String, nullable=True, default="5")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User")