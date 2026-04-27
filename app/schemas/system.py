from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    project: str
    version: str


class ServiceInfoResponse(BaseModel):
    project: str
    version: str
    api_prefix: str
    docs_url: str
