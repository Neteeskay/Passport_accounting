from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class CreateUserRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=255)
    full_name: str = Field(min_length=1, max_length=255)
    role: Literal["admin", "operator"]
    is_active: bool = True


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
