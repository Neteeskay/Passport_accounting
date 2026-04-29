from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.auth import LoginRequest, LoginResponse, LogoutResponse
from app.services.auth import (
    AuthenticationError,
    InactiveUserError,
    RevokedTokenError,
    authenticate_user,
    logout_user,
)

router = APIRouter(tags=["auth"])
bearer_scheme = HTTPBearer(auto_error=False)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    try:
        result = authenticate_user(payload.username, payload.password)
    except AuthenticationError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    except InactiveUserError as error:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error)) from error

    return LoginResponse(**result)


@router.post("/logout", response_model=LogoutResponse)
def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> LogoutResponse:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer access token is required.",
        )

    try:
        logout_user(credentials.credentials)
    except (AuthenticationError, RevokedTokenError) as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error

    return LogoutResponse(message="User session has been successfully closed.")
