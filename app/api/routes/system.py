from fastapi import APIRouter, Depends

from app.api.dependencies.auth import require_roles
from app.schemas.auth import AuthUserResponse
from app.schemas.system import AdminSectionResponse, HealthResponse, ServiceInfoResponse
from app.services.system import build_health_payload, build_service_info

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
def system_health() -> HealthResponse:
    return HealthResponse(**build_health_payload())


@router.get("/info", response_model=ServiceInfoResponse)
def system_info() -> ServiceInfoResponse:
    return ServiceInfoResponse(**build_service_info())


@router.get("/session", response_model=AuthUserResponse)
def system_session(current_user: dict = Depends(require_roles("admin", "operator"))) -> AuthUserResponse:
    return AuthUserResponse(**current_user)


@router.get("/admin", response_model=AdminSectionResponse)
def system_admin_section(
    current_user: dict = Depends(require_roles("admin")),
) -> AdminSectionResponse:
    return AdminSectionResponse(
        message="Admin-only section is available.",
        section="system-admin",
        current_user=AuthUserResponse(**current_user),
    )
