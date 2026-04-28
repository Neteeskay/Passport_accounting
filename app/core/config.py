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
        self.database_url = os.getenv(
            "DATABASE_URL",
            f"sqlite:///{(STORAGE_DIR / 'passport_accounting.db').as_posix()}",
        )
        self.uploads_dir = STORAGE_DIR / "uploads"


@lru_cache
def get_settings() -> Settings:
    return Settings()
