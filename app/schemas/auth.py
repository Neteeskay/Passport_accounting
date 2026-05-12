from typing import Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from app.core.api_utils import to_camel


class AuthApiModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
    )


class LoginRequest(AuthApiModel):
    username: str = Field(validation_alias=AliasChoices("username", "login"))
    password: str


class CreateUserRequest(AuthApiModel):
    username: str = Field(
        min_length=3,
        max_length=100,
        validation_alias=AliasChoices("username", "login"),
        serialization_alias="login",
    )
    password: str = Field(min_length=6, max_length=255)
    full_name: str = Field(min_length=1, max_length=255)
    role: Literal["admin", "operator"]
    is_active: bool = True


class UpdateUserRequest(AuthApiModel):
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
        validation_alias=AliasChoices("username", "login"),
        serialization_alias="login",
    )
    password: str | None = Field(default=None, min_length=6, max_length=255)
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    role: Literal["admin", "operator"] | None = None
    is_active: bool | None = None


class AuthUserResponse(AuthApiModel):
    id: str
    username: str = Field(serialization_alias="login")
    full_name: str
    role: str
    is_active: bool
    created_at: str
    updated_at: str


class LoginResponse(AuthApiModel):
    access_token: str
    token_type: str
    expires_in: int
    user: AuthUserResponse


class LogoutResponse(AuthApiModel):
    message: str
