from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import get_settings
from app.db.session import prepare_storage
from app.services.system import build_health_payload, build_service_info

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    prepare_storage()
    yield


app = FastAPI(
    title=settings.project_name,
    version=settings.project_version,
    debug=settings.debug,
    lifespan=lifespan,
)


@app.get("/", tags=["system"])
def read_root() -> dict[str, str]:
    return build_service_info()


@app.get("/health", tags=["system"])
def read_health() -> dict[str, str]:
    return build_health_payload()


app.include_router(api_router, prefix=settings.api_v1_prefix)
