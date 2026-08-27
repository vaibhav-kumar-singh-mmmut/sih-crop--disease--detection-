"""
app/routers/officers.py — Router for BDO, Agri/Horti Officers, and District/State Officials.
Handles regional filtering (RBAC) and CSV reporting.
"""
import csv
import io
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_role
from app.db.base import get_session
from app.db.models.user import User, UserRole, JurisdictionType
from app.db.models.report import Report, ReportStatus
from app.schemas.report import ReportResponse

router = APIRouter(prefix="/officer", tags=["officer"])

# Allowed roles to access officer endpoints
OFFICER_ROLES = [
    UserRole.BDO,
    UserRole.AGRICULTURE_OFFICER,
    UserRole.HORTICULTURE_OFFICER,
    UserRole.DISTRICT_STATE_OFFICIAL,
]


def apply_regional_filter(stmt, current_user: User):
    """
    Dynamically joins User and applies regional scoping based on the officer's jurisdiction:
    - Block BDO / Block Officers see reports within their block.
    - District Officials see reports within their district.
    - State level sees everything.
    """
    # Join the farmer user profile
    stmt = stmt.join(User, Report.farmer_id == User.id)

    # Scoping checks
    if current_user.role == UserRole.BDO:
        # BDO always scoped to their block
        stmt = stmt.where(User.block == current_user.jurisdiction_name)
    elif current_user.role in [UserRole.AGRICULTURE_OFFICER, UserRole.HORTICULTURE_OFFICER]:
        # Filter by block or district based on designation
        if current_user.jurisdiction_type == JurisdictionType.BLOCK:
            stmt = stmt.where(User.block == current_user.jurisdiction_name)
        elif current_user.jurisdiction_type == JurisdictionType.DISTRICT:
            stmt = stmt.where(User.district == current_user.jurisdiction_name)
    elif current_user.role == UserRole.DISTRICT_STATE_OFFICIAL:
        if current_user.jurisdiction_type == JurisdictionType.DISTRICT:
            stmt = stmt.where(User.district == current_user.jurisdiction_name)
        # State level has no constraint (views entire state/database)
        
    return stmt


def apply_search_filters(
    stmt,
    disease: Optional[str] = None,
    status_filter: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Applies crop disease, status, and date range query parameters."""
    if disease:
        stmt = stmt.where(Report.disease_detected == disease)
    if status_filter:
        stmt = stmt.where(Report.status == status_filter)
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            stmt = stmt.where(Report.captured_at >= start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            stmt = stmt.where(Report.captured_at <= end_dt)
        except ValueError:
            pass
    return stmt


@router.get(
    "/reports",
    response_model=List[ReportResponse],
    dependencies=[Depends(require_role(*OFFICER_ROLES))]
)
async def get_officer_reports(
    disease: Optional[str] = None,
    status_filter: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> List[ReportResponse]:
    """Retrieve filtered crop reports scoped dynamically to the officer's region."""
    stmt = select(Report).order_by(Report.created_at.desc())
    stmt = apply_regional_filter(stmt, current_user)
    stmt = apply_search_filters(stmt, disease, status_filter, start_date, end_date)

    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get(
    "/stats",
    dependencies=[Depends(require_role(*OFFICER_ROLES))]
)
async def get_officer_stats(
    disease: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Compile metrics representing total, resolved, active, and suspicious incidents in their region."""
    # Build count queries
    stmt = select(Report)
    stmt = apply_regional_filter(stmt, current_user)
    stmt = apply_search_filters(stmt, disease, None, start_date, end_date)

    # 1. Total count
    total_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(total_stmt)
    total_count = total_res.scalar() or 0

    # 2. Resolved count
    resolved_stmt = select(func.count()).select_from(stmt.subquery()).where(
        Report.status == ReportStatus.RESOLVED.value
    )
    resolved_res = await db.execute(resolved_stmt)
    resolved_count = resolved_res.scalar() or 0

    # 3. Active outbreaks (ML Pending or Expert Pending)
    active_stmt = select(func.count()).select_from(stmt.subquery()).where(
        or_(
            Report.status == ReportStatus.PENDING_ML.value,
            Report.status == ReportStatus.PENDING_EXPERT.value
        )
    )
    active_res = await db.execute(active_stmt)
    active_count = active_res.scalar() or 0

    # 4. Suspicious count
    suspicious_stmt = select(func.count()).select_from(stmt.subquery()).where(
        Report.is_suspicious == True
    )
    suspicious_res = await db.execute(suspicious_stmt)
    suspicious_count = suspicious_res.scalar() or 0

    resolved_pct = round((resolved_count / total_count) * 100, 1) if total_count > 0 else 100.0

    return {
        "total_incidents": total_count,
        "resolved_percentage": resolved_pct,
        "active_outbreaks": active_count,
        "flagged_suspicious": suspicious_count
    }


@router.get(
    "/export",
    dependencies=[Depends(require_role(*OFFICER_ROLES))]
)
async def export_reports_csv(
    disease: Optional[str] = None,
    status_filter: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Generates a downloadable CSV containing region-filtered report logs."""
    # Select reports and join user info for details
    stmt = select(Report, User).join(User, Report.farmer_id == User.id)
    stmt = apply_regional_filter(stmt, current_user)
    stmt = apply_search_filters(stmt, disease, status_filter, start_date, end_date)

    result = await db.execute(stmt)
    rows = result.all()

    # Build CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Report ID", "Farmer Name", "Farmer Phone", "Village", "Block", "District",
        "Disease Predicted", "Confidence", "Status", "Latitude", "Longitude",
        "Captured At", "Is Suspicious", "Suspicion Reason"
    ])

    for report, farmer in rows:
        writer.writerow([
            report.id,
            farmer.name or "N/A",
            farmer.phone,
            farmer.village or "N/A",
            farmer.block or "N/A",
            farmer.district or "N/A",
            report.disease_detected or "Pending",
            f"{round(report.confidence * 100)}%" if report.confidence else "N/A",
            report.status,
            report.latitude,
            report.longitude,
            report.captured_at.strftime("%Y-%m-%d %H:%M:%S") if report.captured_at else "N/A",
            report.is_suspicious,
            report.suspicion_reason or ""
        ])

    csv_data = output.getvalue()
    output.close()

    filename = f"report_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    headers = {
        "Content-Disposition": f"attachment; filename={filename}",
        "Content-type": "text/csv"
    }

    return Response(content=csv_data, headers=headers, media_type="text/csv")
