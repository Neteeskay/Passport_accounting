from app.core.config import get_settings


def prepare_storage() -> None:
    settings = get_settings()
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.backups_dir.mkdir(parents=True, exist_ok=True)


def get_database_metadata() -> dict[str, str]:
    settings = get_settings()
    return {
        "database_url": settings.database_url,
        "status": "not-configured-yet",
    }
