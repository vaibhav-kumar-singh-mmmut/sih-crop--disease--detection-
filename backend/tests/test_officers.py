"""
tests/test_officers.py — Integration tests for Officer dashboard reports, stats, and exports (BDO scope, etc).
"""
from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from httpx import AsyncClient


class MockHttpxResponse:
    def __init__(self, json_data, status_code=200):
        self.json_data = json_data
        self.status_code = status_code
        self.text = "Mocked Response Text"

    def json(self):
        return self.json_data


@pytest.mark.asyncio
async def test_officer_reports_unauthorized(client: AsyncClient, token_headers):
    """Ensure farmers receive a 403 Forbidden when trying to fetch officer reports."""
    response = await client.get("/officer/reports", headers=token_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
@patch("httpx.AsyncClient.post")
async def test_officer_regional_rbac_filtering(
    mock_post, mock_exif, client: AsyncClient, token_headers, bdo_alpha_token_headers, bdo_beta_token_headers
):
    """Ensure BDOs only retrieve report logs matching their specific block jurisdiction."""
    now = datetime.now(timezone.utc)
    mock_exif.return_value = ((12.3456, 78.9012), now.replace(tzinfo=None))
    mock_post.return_value = MockHttpxResponse({
        "disease": "Tomato___Early_blight",
        "confidence": 0.88,
        "action_category": "CHEMICAL_CONTROL"
    })

    # 1. Register a Farmer in Block Alpha and upload a report
    await client.post(
        "/auth/register/farmer",
        json={
            "phone": "+919876543290",
            "code": "123456",
            "role": "FARMER",
            "name": "Farmer Alpha",
            "village": "Village Alpha",
            "block": "Block Alpha",
            "district": "Pune District",
            "preferred_language": "hi",
        }
    )
    farmer_alpha_login = await client.post(
        "/auth/verify-otp",
        json={"phone": "+919876543290", "code": "123456"}
    )
    token_alpha = farmer_alpha_login.json()["token"]

    create_alpha_resp = await client.post(
        "/reports/",
        data={"latitude": 12.3456, "longitude": 78.9012, "captured_at": now.isoformat()},
        files={"file": ("leaf.jpg", b"bytes", "image/jpeg")},
        headers={"Authorization": f"Bearer {token_alpha}"}
    )
    assert create_alpha_resp.status_code == 201
    report_alpha_id = create_alpha_resp.json()["id"]

    # 2. Register a Farmer in Block Beta and upload a report
    await client.post(
        "/auth/register/farmer",
        json={
            "phone": "+919876543291",
            "code": "123456",
            "role": "FARMER",
            "name": "Farmer Beta",
            "village": "Village Beta",
            "block": "Block Beta",
            "district": "Pune District",
            "preferred_language": "hi",
        }
    )
    farmer_beta_login = await client.post(
        "/auth/verify-otp",
        json={"phone": "+919876543291", "code": "123456"}
    )
    token_beta = farmer_beta_login.json()["token"]

    create_beta_resp = await client.post(
        "/reports/",
        data={"latitude": 12.4456, "longitude": 78.8012, "captured_at": now.isoformat()},
        files={"file": ("leaf.jpg", b"bytes", "image/jpeg")},
        headers={"Authorization": f"Bearer {token_beta}"}
    )
    assert create_beta_resp.status_code == 201

    # 3. BDO Alpha fetches reports — should see report from Block Alpha only
    bdo_alpha_resp = await client.get("/officer/reports", headers=bdo_alpha_token_headers)
    assert bdo_alpha_resp.status_code == 200
    alpha_reports = bdo_alpha_resp.json()
    assert len(alpha_reports) == 1
    assert alpha_reports[0]["id"] == report_alpha_id

    # 4. BDO Beta fetches reports — should see report from Block Beta only
    bdo_beta_resp = await client.get("/officer/reports", headers=bdo_beta_token_headers)
    assert bdo_beta_resp.status_code == 200
    beta_reports = bdo_beta_resp.json()
    assert len(beta_reports) == 1
    assert beta_reports[0]["id"] != report_alpha_id

    # 5. Verify stats for BDO Alpha
    stats_resp = await client.get("/officer/stats", headers=bdo_alpha_token_headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_incidents"] == 1
    assert stats["resolved_percentage"] == 100.0

    # 6. Verify CSV export for BDO Alpha
    export_resp = await client.get("/officer/export", headers=bdo_alpha_token_headers)
    assert export_resp.status_code == 200
    assert export_resp.headers["Content-Disposition"].startswith("attachment; filename=report_logs_")
    assert "Farmer Alpha" in export_resp.text
    assert "Farmer Beta" not in export_resp.text
