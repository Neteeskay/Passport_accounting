from fastapi import APIRouter

from app.schemas.system import HealthResponse, ServiceInfoResponse
from app.services.system import build_health_payload, build_service_info

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
def system_health() -> HealthResponse:
    return HealthResponse(**build_health_payload())


@router.get("/info", response_model=ServiceInfoResponse)
def system_info() -> ServiceInfoResponse:
    return ServiceInfoResponse(**build_service_info())
