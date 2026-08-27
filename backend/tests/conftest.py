"""
tests/conftest.py — Shareable pytest fixtures for test_reports, test_expert, and test_auth.
"""
import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Override database to SQLite memory/file for testing
os.environ["DB_URL"] = "sqlite+aiosqlite:///./test_crop.db"
os.environ["JWT_SECRET"] = "test-secret-key-for-tests-only"
os.environ["OTP_PROVIDER"] = "mock"

from main import app
from app.db.base import create_all_tables, engine, Base


@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_db():
    """Create all tables before module tests run and drop after."""
    await create_all_tables()
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture()
async def client():
    """Returns an async HTTPX test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture()
async def token_headers(client: AsyncClient):
    """Logs in as a mock farmer and returns authorization headers."""
    # Ensure farmer is registered
    await client.post(
        "/auth/register/farmer",
        json={
            "phone": "+919876543210",
            "code": "123456",
            "role": "FARMER",
            "name": "Test Farmer",
            "village": "Test Village",
            "block": "Test Block",
            "district": "Test District",
            "preferred_language": "hi",
        }
    )
    # Login to get token
    login = await client.post(
        "/auth/verify-otp",
        json={"phone": "+919876543210", "code": "123456"}
    )
    token = login.json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture()
async def expert_token_headers(client: AsyncClient):
    """Logs in as a mock KVK expert and returns authorization headers."""
    # Ensure expert is registered
    await client.post(
        "/auth/register/officer",
        json={
            "phone": "+919876543212",
            "code": "123456",
            "role": "KVK_LAB_EXPERT",
            "name": "Dr. Priya Sharma",
            "designation": "Senior Scientist",
            "jurisdiction_type": "district",
            "jurisdiction_name": "Pune District",
        }
    )
    # Login
    login = await client.post(
        "/auth/verify-otp",
        json={"phone": "+919876543212", "code": "123456"}
    )
    token = login.json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture()
async def bdo_alpha_token_headers(client: AsyncClient):
    """Logs in as BDO for Block Alpha."""
    await client.post(
        "/auth/register/officer",
        json={
            "phone": "+919876543213",
            "code": "123456",
            "role": "BDO",
            "name": "BDO Alpha",
            "designation": "Block Development Officer",
            "jurisdiction_type": "block",
            "jurisdiction_name": "Block Alpha",
        }
    )
    login = await client.post(
        "/auth/verify-otp",
        json={"phone": "+919876543213", "code": "123456"}
    )
    token = login.json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture()
async def bdo_beta_token_headers(client: AsyncClient):
    """Logs in as BDO for Block Beta."""
    await client.post(
        "/auth/register/officer",
        json={
            "phone": "+919876543214",
            "code": "123456",
            "role": "BDO",
            "name": "BDO Beta",
            "designation": "Block Development Officer",
            "jurisdiction_type": "block",
            "jurisdiction_name": "Block Beta",
        }
    )
    login = await client.post(
        "/auth/verify-otp",
        json={"phone": "+919876543214", "code": "123456"}
    )
    token = login.json()["token"]
    return {"Authorization": f"Bearer {token}"}
