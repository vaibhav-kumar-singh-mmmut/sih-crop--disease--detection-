"""
tests/test_expert.py — Integration tests for KVK Expert validation queue and stats.
"""
from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from httpx import AsyncClient

from app.db.models.report import ReportStatus


class MockHttpxResponse:
    def __init__(self, json_data, status_code=200):
        self.json_data = json_data
        self.status_code = status_code
        self.text = "Mocked Response Text"

    def json(self):
        return self.json_data


@pytest.mark.asyncio
async def test_get_expert_queue_unauthorized(client: AsyncClient, token_headers):
    """Ensure a farmer receives a 403 Forbidden when trying to access the expert queue."""
    response = await client.get("/expert/queue", headers=token_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
@patch("httpx.AsyncClient.post")
async def test_get_expert_queue_and_validate(
    mock_post, mock_exif, client: AsyncClient, token_headers, expert_token_headers
):
    """Ensure KVK Experts can view the queue, validate reports, and check stats."""
    # 1. Create a low-confidence report as a farmer (confidence = 0.58)
    now = datetime.now(timezone.utc)
    mock_exif.return_value = ((12.3456, 78.9012), now.replace(tzinfo=None))
    mock_post.return_value = MockHttpxResponse({
        "disease": "Rice___Brown_spot",
        "confidence": 0.58,
        "action_category": "NUTRITIONAL_CONTROL"
    })

    create_resp = await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": now.isoformat(),
        },
        files={"file": ("test.jpg", b"jpeg_bytes", "image/jpeg")},
        headers=token_headers,
    )
    assert create_resp.status_code == 201
    report_id = create_resp.json()["id"]

    # 2. Expert fetches the queue — should contain the report
    queue_resp = await client.get("/expert/queue", headers=expert_token_headers)
    assert queue_resp.status_code == 200
    queue_data = queue_resp.json()
    assert len(queue_data) >= 1
    assert any(r["id"] == report_id for r in queue_data)

    # 3. Expert overrides/validates the report
    validate_resp = await client.post(
        f"/expert/validate/{report_id}",
        json={
            "corrected_disease": "Tomato___Early_blight",
            "expert_notes": "Visually corrected leaf spots."
        },
        headers=expert_token_headers
    )
    assert validate_resp.status_code == 200
    report_data = validate_resp.json()
    assert report_data["status"] == "RESOLVED"
    assert report_data["disease_detected"] == "Tomato___Early_blight"
    assert report_data["expert_corrected_disease"] == "Tomato___Early_blight"
    assert report_data["expert_notes"] == "Visually corrected leaf spots."
    assert report_data["validated_by"] is not None

    # 4. Fetch expert stats — should reflect validated report
    stats_resp = await client.get("/expert/stats", headers=expert_token_headers)
    assert stats_resp.status_code == 200
    stats_data = stats_resp.json()
    assert stats_data["validated_count"] >= 1
    assert stats_data["retrain_count"] >= 1
