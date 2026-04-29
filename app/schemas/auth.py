from datetime import datetime

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthUserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: AuthUserResponse


class LogoutResponse(BaseModel):
    message: str
