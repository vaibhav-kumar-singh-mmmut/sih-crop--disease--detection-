"""
app/routers/expert.py — Router for KVK / Lab Expert validation queue and stats.
"""
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_role
from app.db.base import get_session
from app.db.models.user import User, UserRole
from app.db.models.report import Report, ReportStatus
from app.schemas.report import ReportResponse

router = APIRouter(prefix="/expert", tags=["expert"])


class ValidateReportRequest(BaseModel):
    corrected_disease: str
    expert_notes: Optional[str] = None


class ExpertStatsResponse(BaseModel):
    pending_count: int
    validated_count: int
    retrain_count: int


@router.get(
    "/queue",
    response_model=List[ReportResponse],
    dependencies=[Depends(require_role(UserRole.KVK_LAB_EXPERT))]
)
async def get_expert_queue(
    db: AsyncSession = Depends(get_session),
) -> List[ReportResponse]:
    """
    Retrieve list of reports pending expert verification.
    Includes low-confidence predictions (PENDING_EXPERT) and suspicious cases.
    """
    stmt = (
        select(Report)
        .where(
            or_(
                Report.status == ReportStatus.PENDING_EXPERT.value,
                Report.is_suspicious == True
            )
        )
        .order_by(Report.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post(
    "/validate/{report_id}",
    response_model=ReportResponse,
)
async def validate_report(
    report_id: str,
    payload: ValidateReportRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ReportResponse:
    """
    Override AI predictions with expert verified diagnosis.
    Sets status to RESOLVED and saves corrected labels to the audit columns.
    """
    # Enforce role inside handler body so we can inspect current_user info
    if current_user.role != UserRole.KVK_LAB_EXPERT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only KVK Lab Experts are authorized to validate reports."
        )

    stmt = select(Report).where(Report.id == report_id)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )

    # Apply expert overrides
    report.expert_corrected_disease = payload.corrected_disease
    report.disease_detected = payload.corrected_disease  # final display name
    report.expert_notes = payload.expert_notes
    report.validated_by = current_user.id
    report.validated_at = datetime.now(timezone.utc)
    report.status = ReportStatus.RESOLVED.value

    await db.flush()
    return report


@router.get(
    "/stats",
    response_model=ExpertStatsResponse,
    dependencies=[Depends(require_role(UserRole.KVK_LAB_EXPERT))]
)
async def get_expert_stats(
    db: AsyncSession = Depends(get_session),
) -> ExpertStatsResponse:
    """Compile validation queue sizes and retraining dataset counts."""
    # 1. Pending count
    p_stmt = select(func.count()).select_from(Report).where(
        or_(
            Report.status == ReportStatus.PENDING_EXPERT.value,
            Report.is_suspicious == True
        )
    )
    p_res = await db.execute(p_stmt)
    pending_count = p_res.scalar() or 0

    # 2. Validated count (Resolved reports overridden or marked by expert)
    v_stmt = select(func.count()).select_from(Report).where(
        Report.validated_by != None
    )
    v_res = await db.execute(v_stmt)
    validated_count = v_res.scalar() or 0

    # 3. Retrain count (Reports with modified/corrected labels)
    r_stmt = select(func.count()).select_from(Report).where(
        Report.expert_corrected_disease != None
    )
    r_res = await db.execute(r_stmt)
    retrain_count = r_res.scalar() or 0

    return ExpertStatsResponse(
        pending_count=pending_count,
        validated_count=validated_count,
        retrain_count=retrain_count
    )
