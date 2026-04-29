from fastapi import APIRouter

from app.api.routes import auth, citizens, stamps, system

api_router = APIRouter()
api_router.include_router(system.router, prefix="/system")
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(citizens.router, prefix="/citizens")
api_router.include_router(stamps.router, prefix="/citizens/{citizen_id}/stamps")
