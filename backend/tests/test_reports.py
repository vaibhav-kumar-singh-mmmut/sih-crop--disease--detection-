"""
tests/test_reports.py — Integration tests for crop report uploads, geotag checks, and offline queue sync.
"""
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock

import pytest
from httpx import AsyncClient

from app.db.models.user import User, UserRole


class MockHttpxResponse:
    def __init__(self, json_data, status_code=200):
        self.json_data = json_data
        self.status_code = status_code
        self.text = "Mocked Response Text"

    def json(self):
        return self.json_data


@pytest.fixture
def test_image_bytes():
    """Returns a minimal mock file payload."""
    return b"dummy_jpeg_data"


@pytest.mark.asyncio
async def test_create_report_unauthenticated(client: AsyncClient, test_image_bytes):
    """Ensure anonymous requests are rejected."""
    response = await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": datetime.now(timezone.utc).isoformat(),
        },
        files={"file": ("test.jpg", test_image_bytes, "image/jpeg")},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
@patch("httpx.AsyncClient.post")
async def test_create_report_success_resolved(mock_post, mock_exif, client: AsyncClient, test_image_bytes, token_headers):
    """Ensure report is successfully created and status set to RESOLVED for high-confidence predictions."""
    now = datetime.now(timezone.utc)
    mock_exif.return_value = ((12.3456, 78.9012), now.replace(tzinfo=None))
    
    # Mock high-confidence prediction
    mock_post.return_value = MockHttpxResponse({
        "disease": "Tomato___Early_blight",
        "confidence": 0.85,
        "action_category": "CHEMICAL_CONTROL"
    })

    response = await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": now.isoformat(),
        },
        files={"file": ("test.jpg", test_image_bytes, "image/jpeg")},
        headers=token_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["latitude"] == 12.3456
    assert data["longitude"] == 78.9012
    assert data["is_suspicious"] is False
    assert data["disease_detected"] == "Tomato___Early_blight"
    assert data["confidence"] == 0.85
    assert data["status"] == "RESOLVED"


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
@patch("httpx.AsyncClient.post")
async def test_create_report_success_pending_expert(mock_post, mock_exif, client: AsyncClient, test_image_bytes, token_headers):
    """Ensure report is created with status PENDING_EXPERT for low-confidence predictions."""
    now = datetime.now(timezone.utc)
    mock_exif.return_value = ((12.3456, 78.9012), now.replace(tzinfo=None))
    
    # Mock low-confidence prediction (< 0.70)
    mock_post.return_value = MockHttpxResponse({
        "disease": "Rice___Brown_spot",
        "confidence": 0.58,
        "action_category": "NUTRITIONAL_CONTROL"
    })

    response = await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": now.isoformat(),
        },
        files={"file": ("test.jpg", test_image_bytes, "image/jpeg")},
        headers=token_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "PENDING_EXPERT"
    assert data["disease_detected"] == "Rice___Brown_spot"
    assert data["confidence"] == 0.58


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
@patch("httpx.AsyncClient.post")
async def test_create_report_ml_unreachable_fallback(mock_post, mock_exif, client: AsyncClient, test_image_bytes, token_headers):
    """Ensure report is created with PENDING_ML status if the ML service is offline."""
    now = datetime.now(timezone.utc)
    mock_exif.return_value = ((12.3456, 78.9012), now.replace(tzinfo=None))
    
    # Mock connection timeout or failure
    mock_post.side_effect = Exception("Connection refused")

    response = await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": now.isoformat(),
        },
        files={"file": ("test.jpg", test_image_bytes, "image/jpeg")},
        headers=token_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "PENDING_ML"
    assert data["disease_detected"] is None
    assert data["confidence"] is None


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
async def test_create_report_no_gps_rejected(mock_exif, client: AsyncClient, test_image_bytes, token_headers):
    """Ensure report is rejected if EXIF lacks GPS geotags."""
    now = datetime.now(timezone.utc)
    # Mock EXIF returning no GPS info
    mock_exif.return_value = (None, now.replace(tzinfo=None))

    response = await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": now.isoformat(),
        },
        files={"file": ("test.jpg", test_image_bytes, "image/jpeg")},
        headers=token_headers,
    )
    assert response.status_code == 400
    assert "GPS metadata" in response.json()["detail"]


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
async def test_create_report_timestamp_mismatch_rejected(mock_exif, client: AsyncClient, test_image_bytes, token_headers):
    """Ensure report is rejected if EXIF timestamp differs from form captured_at by > 1 hour."""
    now = datetime.now(timezone.utc)
    old_time = now - timedelta(hours=2)
    # Mock EXIF returning coordinates but a timestamp that is 2 hours old
    mock_exif.return_value = ((12.3456, 78.9012), old_time.replace(tzinfo=None))

    response = await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": now.isoformat(),
        },
        files={"file": ("test.jpg", test_image_bytes, "image/jpeg")},
        headers=token_headers,
    )
    assert response.status_code == 400
    assert "Capture timestamp" in response.json()["detail"]


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
@patch("httpx.AsyncClient.post")
async def test_create_report_coordinates_mismatch_flagged(mock_post, mock_exif, client: AsyncClient, test_image_bytes, token_headers):
    """Ensure report is accepted but flagged as suspicious if form coordinates don't match EXIF."""
    now = datetime.now(timezone.utc)
    # Mock EXIF returning coordinates different from form (e.g. 12.5000 vs 12.3456)
    mock_exif.return_value = ((12.5000, 78.9012), now.replace(tzinfo=None))
    mock_post.return_value = MockHttpxResponse({
        "disease": "Tomato___Early_blight",
        "confidence": 0.85,
        "action_category": "CHEMICAL_CONTROL"
    })

    response = await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": now.isoformat(),
        },
        files={"file": ("test.jpg", test_image_bytes, "image/jpeg")},
        headers=token_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["is_suspicious"] is True
    assert "mismatch" in data["suspicion_reason"].lower()


@pytest.mark.asyncio
@patch("app.routers.reports.extract_exif_metadata")
@patch("httpx.AsyncClient.post")
async def test_get_my_reports(mock_post, mock_exif, client: AsyncClient, test_image_bytes, token_headers):
    """Ensure a user can successfully retrieve their list of submitted reports."""
    now = datetime.now(timezone.utc)
    mock_exif.return_value = ((12.3456, 78.9012), now.replace(tzinfo=None))
    mock_post.return_value = MockHttpxResponse({
        "disease": "Tomato___Early_blight",
        "confidence": 0.85,
        "action_category": "CHEMICAL_CONTROL"
    })

    # Create a report first
    await client.post(
        "/reports/",
        data={
            "latitude": 12.3456,
            "longitude": 78.9012,
            "captured_at": now.isoformat(),
        },
        files={"file": ("test.jpg", test_image_bytes, "image/jpeg")},
        headers=token_headers,
    )

    # Get list
    response = await client.get("/reports/", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["latitude"] == 12.3456
