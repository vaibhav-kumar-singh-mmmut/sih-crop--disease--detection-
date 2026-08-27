"""
app/routers/reports.py — Endpoints for report uploads, geotagging checks, and offline sync.
"""
from datetime import datetime, timezone
import logging
import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from PIL import Image, ExifTags

import httpx
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.db.base import get_session
from app.db.models.user import User
from app.db.models.report import Report, ReportStatus
from app.schemas.report import ReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])
logger = logging.getLogger(__name__)

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Helper functions for EXIF processing ─────────────────────────────────────

def convert_to_degrees(value) -> float:
    """Helper to convert EXIF GPS fractions (degrees, minutes, seconds) to float degrees."""
    try:
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except (IndexError, TypeError, ZeroDivisionError, ValueError):
        return 0.0


def extract_exif_metadata(image_path: str):
    """Extract GPS coordinates and capture timestamp from image EXIF headers."""
    try:
        with Image.open(image_path) as img:
            exif_raw = img._getexif()
            if not exif_raw:
                return None, None

            exif = {ExifTags.TAGS.get(tag, tag): val for tag, val in exif_raw.items()}

            # Extract Timestamp
            captured_at = None
            for tag in ["DateTimeOriginal", "DateTimeDigitized", "DateTime"]:
                if tag in exif:
                    try:
                        captured_at = datetime.strptime(exif[tag], "%Y:%m:%d %H:%M:%S")
                        break
                    except ValueError:
                        continue

            # Extract GPS coordinates
            gps_coords = None
            if "GPSInfo" in exif:
                gps_info = exif["GPSInfo"]
                # Tags: 1=LatRef, 2=LatVal, 3=LngRef, 4=LngVal
                try:
                    lat_ref = gps_info.get(1)
                    lat_val = gps_info.get(2)
                    lng_ref = gps_info.get(3)
                    lng_val = gps_info.get(4)

                    if lat_ref and lat_val and lng_ref and lng_val:
                        lat = convert_to_degrees(lat_val)
                        if lat_ref != 'N':
                            lat = -lat

                        lng = convert_to_degrees(lng_val)
                        if lng_ref != 'E':
                            lng = -lng

                        if lat != 0.0 or lng != 0.0:
                            gps_coords = (lat, lng)
                except Exception as ex:
                    logger.warning(f"Error parsing EXIF GPS: {ex}")

            return gps_coords, captured_at
    except Exception as ex:
        logger.error(f"Failed to open image for EXIF parsing: {ex}")
        return None, None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    latitude: float = Form(...),
    longitude: float = Form(...),
    captured_at: str = Form(...),  # Expected format: ISO 8601 string
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ReportResponse:
    """
    Submit a crop report with geotags and file attachment.
    Inspects image EXIF for fraud detection and verifies coordinates matching.
    """
    # 1. Parse client-submitted captured_at
    try:
        client_time = datetime.fromisoformat(captured_at.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid captured_at timestamp format. Must be ISO 8601."
        )

    # 2. Save file temporarily to disk to run PIL/Exif verification
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    if file_ext.lower() not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG/PNG images are supported."
        )

    report_id = str(uuid.uuid4())
    safe_filename = f"{report_id}{file_ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        content = await file.read()
        with open(dest_path, "wb") as f:
            f.write(content)
    except Exception as ex:
        logger.error(f"Failed to write uploaded file to static directory: {ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save uploaded image."
        )

    # 3. EXIF metadata extraction & validation
    exif_gps, exif_time = extract_exif_metadata(dest_path)

    # Fraud rule A: Reject if no GPS coordinates present in EXIF tags
    if not exif_gps:
        # Cleanup file on error
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geotagging verification failed: Captured image must contain GPS metadata."
        )

    # Fraud rule B: Reject if EXIF timestamp differs from client form timestamp by > 1 hour
    if exif_time:
        # Ensure exif_time is offset-naive or matched
        client_naive = client_time.replace(tzinfo=None)
        time_diff = abs((client_naive - exif_time).total_seconds())
        if time_diff > 3600:  # 1 hour
            if os.path.exists(dest_path):
                os.remove(dest_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="EXIF verification failed: Capture timestamp does not match upload metadata context."
            )

    # Fraud Audit Check C: Flag (do not reject) if form coordinates mismatch EXIF coordinates
    is_suspicious = False
    suspicion_reason = None

    exif_lat, exif_lng = exif_gps
    # Compare with 0.005 threshold (~500 meters accuracy)
    if abs(exif_lat - latitude) > 0.005 or abs(exif_lng - longitude) > 0.005:
        is_suspicious = True
        suspicion_reason = (
            f"Coordinates mismatch: Form ({latitude:.4f}, {longitude:.4f}) "
            f"does not match EXIF ({exif_lat:.4f}, {exif_lng:.4f})"
        )

    # 4. Invoke ML Disease Detection Microservice
    disease_detected = None
    confidence = None
    report_status = ReportStatus.PENDING_ML.value

    try:
        with open(dest_path, "rb") as f:
            img_bytes = f.read()

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                settings.ml_service_url,
                files={"file": (safe_filename, img_bytes, "image/jpeg")}
            )
            if response.status_code == 200:
                pred = response.json()
                disease_detected = pred["disease"]
                confidence = pred["confidence"]
                if confidence < 0.70:
                    report_status = ReportStatus.PENDING_EXPERT.value
                else:
                    report_status = ReportStatus.RESOLVED.value
            else:
                logger.warning(f"ML service returned status {response.status_code}: {response.text}")
    except Exception as ex:
        logger.error(f"Failed to communicate with ML service: {ex}")

    # 5. Create database record
    report = Report(
        id=report_id,
        farmer_id=current_user.id,
        image_path=f"/static/uploads/{safe_filename}",
        latitude=latitude,
        longitude=longitude,
        captured_at=client_time,
        disease_detected=disease_detected,
        confidence=confidence,
        status=report_status,
        is_suspicious=is_suspicious,
        suspicion_reason=suspicion_reason,
    )

    db.add(report)
    await db.flush()  # populate fields like created_at

    return report


@router.get("/", response_model=List[ReportResponse])
async def get_my_reports(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> List[ReportResponse]:
    """Retrieve all reports submitted by the currently authenticated user."""
    stmt = select(Report).where(Report.farmer_id == current_user.id).order_by(Report.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())
