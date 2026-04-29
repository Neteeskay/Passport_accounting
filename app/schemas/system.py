from pydantic import BaseModel

from app.schemas.auth import AuthUserResponse


class HealthResponse(BaseModel):
    status: str
    project: str
    version: str


class ServiceInfoResponse(BaseModel):
    project: str
    version: str
    api_prefix: str
    docs_url: str


class AdminSectionResponse(BaseModel):
    message: str
    section: str
    current_user: AuthUserResponse
