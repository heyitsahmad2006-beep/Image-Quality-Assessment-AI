import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from ..db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analyses = relationship("AnalysisRecord", back_populates="owner", cascade="all, delete-orphan")


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    overall_quality_score = Column(Float, nullable=False)
    quality_category = Column(String(50), nullable=False)
    suitability = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    processing_time_ms = Column(Float, nullable=False)
    defects = Column(JSON, nullable=False)
    technical_metrics = Column(JSON, nullable=False)
    recommendations = Column(JSON, nullable=False)
    mode = Column(String(50), nullable=False, default="Heuristic Mode")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="analyses")
