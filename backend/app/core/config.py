"""
app/core/config.py — Application settings loaded from environment variables.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    db_url: str = "sqlite+aiosqlite:///./crop_dev.db"  # fallback for dev without Docker

    # JWT
    jwt_secret: str = "dev-secret-change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24h

    # OTP
    otp_expire_minutes: int = 5
    otp_provider: str = "mock"  # "mock" | "twilio" | "msg91"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # ML Inference Service
    ml_service_url: str = "http://localhost:8001/predict"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    # Twilio (optional)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""

    # MSG91 (optional)
    msg91_api_key: str = ""
    msg91_sender_id: str = ""


settings = Settings()
