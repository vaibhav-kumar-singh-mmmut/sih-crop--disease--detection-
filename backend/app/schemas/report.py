"""
app/schemas/report.py — Pydantic schemas for crop report validation and serialization.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    farmer_id: str
    image_path: str
    latitude: float
    longitude: float
    captured_at: datetime
    disease_detected: Optional[str] = None
    confidence: Optional[float] = None
    status: str
    is_suspicious: bool
    suspicion_reason: Optional[str] = None
    expert_corrected_disease: Optional[str] = None
    expert_notes: Optional[str] = None
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    created_at: datetime
