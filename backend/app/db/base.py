"""
app/db/base.py — SQLAlchemy async engine, session factory, and base declarative model.
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Create the async engine — supports both PostgreSQL (asyncpg) and SQLite (aiosqlite)
engine = create_async_engine(
    settings.db_url,
    echo=False,  # set True for SQL query logging during development
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Shared base class for all ORM models."""
    pass


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides a database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def create_all_tables() -> None:
    """
    Create all tables from ORM models (used during startup / tests).
    In production, prefer running: alembic upgrade head
    """
    async with engine.begin() as conn:
        from app.db.models import user, otp, report  # noqa: F401 — import to register models
        await conn.run_sync(Base.metadata.create_all)
