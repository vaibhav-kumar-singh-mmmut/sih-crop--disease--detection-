"""
app/db/models/report.py — ORM model representing crop scans and diagnosis submissions.
"""
from datetime import datetime, timezone
import enum

from sqlalchemy import Column, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class ReportStatus(str, enum.Enum):
    PENDING_ML = "PENDING_ML"
    PENDING_EXPERT = "PENDING_EXPERT"
    RESOLVED = "RESOLVED"


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, index=True)
    farmer_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    image_path = Column(String(512), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    captured_at = Column(DateTime(timezone=True), nullable=False)

    # ML results (Phase 4)
    disease_detected = Column(String(255), nullable=True)
    confidence = Column(Float, nullable=True)
    status = Column(String(50), default=ReportStatus.PENDING_ML.value, nullable=False)

    # Fraud audits
    is_suspicious = Column(Boolean, default=False, nullable=False)
    suspicion_reason = Column(String(512), nullable=True)

    # Expert validation (Phase 6)
    expert_corrected_disease = Column(String(255), nullable=True)
    expert_notes = Column(String(512), nullable=True)
    validated_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    validated_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    farmer = relationship("User", backref="reports")
