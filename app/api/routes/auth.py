from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_bearer_token, get_current_user
from app.schemas.auth import AuthUserResponse, LoginRequest, LoginResponse, LogoutResponse
from app.services.auth import (
    AuthenticationError,
    InactiveUserError,
    RevokedTokenError,
    authenticate_user,
    logout_user,
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
