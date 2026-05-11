from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_bearer_token, get_current_user, require_roles
from app.schemas.auth import (
    AuthUserResponse,
    CreateUserRequest,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
)
from app.services.auth import (
    AuthenticationError,
    InactiveUserError,
    RevokedTokenError,
    authenticate_user,
    create_user,
    logout_user,
    UserConflictError,
)

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    try:
        result = authenticate_user(payload.username, payload.password)
    except AuthenticationError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    except InactiveUserError as error:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error)) from error

    return LoginResponse(**result)


@router.post("/users", response_model=AuthUserResponse, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    payload: CreateUserRequest,
    _current_admin: dict = Depends(require_roles("admin")),
) -> AuthUserResponse:
    try:
        user = create_user(payload.model_dump())
    except UserConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error

    return AuthUserResponse(**user)


@router.get("/me", response_model=AuthUserResponse)
def read_current_user(current_user: dict = Depends(get_current_user)) -> AuthUserResponse:
    return AuthUserResponse(**current_user)


@router.post("/logout", response_model=LogoutResponse)
def logout(token: str = Depends(get_bearer_token)) -> LogoutResponse:
    try:
        logout_user(token)
    except (AuthenticationError, RevokedTokenError) as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error

    return LogoutResponse(message="User session has been successfully closed.")
