from functools import lru_cache
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BASE_DIR / "storage"


class Settings:
    def __init__(self) -> None:
        self.project_name = os.getenv("PROJECT_NAME", "Passport Accounting API")
        self.project_version = os.getenv("PROJECT_VERSION", "0.1.0")
        self.api_v1_prefix = os.getenv("API_V1_PREFIX", "/api/v1")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        self.auth_secret = os.getenv("AUTH_SECRET", "change-me-in-production")
        self.access_token_ttl_minutes = int(os.getenv("ACCESS_TOKEN_TTL_MINUTES", "720"))
        self.database_url = os.getenv(
            "DATABASE_URL",
            f"sqlite:///{(STORAGE_DIR / 'passport_accounting.db').as_posix()}",
        )
        self.uploads_dir = STORAGE_DIR / "uploads"
        self.default_admin_username = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
        self.default_admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
        self.default_operator_username = os.getenv("DEFAULT_OPERATOR_USERNAME", "operator")
        self.default_operator_password = os.getenv("DEFAULT_OPERATOR_PASSWORD", "operator123")


@lru_cache
def get_settings() -> Settings:
    return Settings()
