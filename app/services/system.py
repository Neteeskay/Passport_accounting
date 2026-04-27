from app.core.config import get_settings


def build_health_payload() -> dict[str, str]:
    settings = get_settings()
    return {
        "status": "ok",
        "project": settings.project_name,
        "version": settings.project_version,
    }


def build_service_info() -> dict[str, str]:
    settings = get_settings()
    return {
        "project": settings.project_name,
        "version": settings.project_version,
        "api_prefix": settings.api_v1_prefix,
        "docs_url": "/docs",
    }
