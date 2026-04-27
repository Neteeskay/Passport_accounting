from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BASE_DIR / "storage"


class Settings(BaseSettings):
    project_name: str = "Passport Accounting API"
    project_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False
    database_url: str = f"sqlite:///{(STORAGE_DIR / 'passport_accounting.db').as_posix()}"
    uploads_dir: Path = STORAGE_DIR / "uploads"
    backups_dir: Path = STORAGE_DIR / "backups"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
