from fastapi import APIRouter

from app.api.routes import citizens, system

api_router = APIRouter()
api_router.include_router(system.router, prefix="/system")
api_router.include_router(citizens.router, prefix="/citizens")
