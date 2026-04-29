from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.auth import (
    AuthenticationError,
    AuthorizationError,
    InactiveUserError,
    RevokedTokenError,
    ensure_user_role,
    validate_access_token,
)

bearer_scheme = HTTPBearer(auto_error=False)


def get_bearer_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer access token is required.",
        )

    return credentials.credentials


def get_current_auth_context(token: str = Depends(get_bearer_token)) -> dict:
    try:
        return validate_access_token(token)
    except AuthenticationError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    except RevokedTokenError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    except InactiveUserError as error:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error)) from error


def get_current_user(context: dict = Depends(get_current_auth_context)) -> dict:
    return dict(context["user"])


def ensure_roles(user: dict, allowed_roles: tuple[str, ...]) -> dict:
    return ensure_user_role(user, allowed_roles)


def require_roles(*allowed_roles: str) -> Callable:
    def dependency(current_user: dict = Depends(get_current_user)) -> dict:
        try:
            return ensure_roles(current_user, allowed_roles)
        except AuthorizationError as error:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error)) from error

    return dependency
