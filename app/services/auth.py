import base64
import hashlib
import hmac
import json
import os
import sqlite3
import time

from app.core.config import get_settings

PASSWORD_SCHEME = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 100_000


class AuthenticationError(Exception):
    """Raised when username or password is invalid."""


class InactiveUserError(Exception):
    """Raised when user exists but is inactive."""


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str, salt: str | None = None) -> str:
    actual_salt = salt or os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        actual_salt.encode("utf-8"),
        PASSWORD_ITERATIONS,
    )
    return (
        f"{PASSWORD_SCHEME}${PASSWORD_ITERATIONS}$"
        f"{actual_salt}${digest.hex()}"
    )


def verify_password(password: str, password_hash: str) -> bool:
    try:
        scheme, iterations, salt, expected_digest = password_hash.split("$", 3)
    except ValueError:
        return False

    if scheme != PASSWORD_SCHEME:
        return False

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        int(iterations),
    ).hex()
    return hmac.compare_digest(digest, expected_digest)


def create_access_token(user: dict) -> tuple[str, int]:
    settings = get_settings()
    expires_in = settings.access_token_ttl_minutes * 60
    now = int(time.time())

    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "role": user["role"],
        "iat": now,
        "exp": now + expires_in,
    }

    encoded_header = _b64url_encode(
        json.dumps(header, separators=(",", ":")).encode("utf-8")
    )
    encoded_payload = _b64url_encode(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    )
    signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
    signature = hmac.new(
        settings.auth_secret.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    token = f"{encoded_header}.{encoded_payload}.{_b64url_encode(signature)}"
    return token, expires_in


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".", 2)
    except ValueError as error:
        raise AuthenticationError("Invalid access token format.") from error

    signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
    expected_signature = hmac.new(
        settings.auth_secret.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    actual_signature = _b64url_decode(encoded_signature)

    if not hmac.compare_digest(expected_signature, actual_signature):
        raise AuthenticationError("Invalid access token signature.")

    payload = json.loads(_b64url_decode(encoded_payload).decode("utf-8"))
    if int(payload["exp"]) < int(time.time()):
        raise AuthenticationError("Access token has expired.")

    return payload


def _serialize_user(row: sqlite3.Row) -> dict:
    return {
        "id": int(row["id"]),
        "username": str(row["username"]),
        "full_name": str(row["full_name"]),
        "role": str(row["role"]),
        "is_active": bool(row["is_active"]),
        "created_at": str(row["created_at"]),
        "updated_at": str(row["updated_at"]),
    }


def find_user_by_username(connection: sqlite3.Connection, username: str) -> sqlite3.Row | None:
    return connection.execute(
        """
        SELECT id, username, password_hash, full_name, role, is_active, created_at, updated_at
        FROM users
        WHERE username = ?
        LIMIT 1
        """,
        (username.strip(),),
    ).fetchone()


def authenticate_user(username: str, password: str) -> dict:
    from app.db.session import get_connection

    with get_connection() as connection:
        user_row = find_user_by_username(connection, username)
        if user_row is None or not verify_password(password, str(user_row["password_hash"])):
            raise AuthenticationError("Invalid username or password.")

        if not bool(user_row["is_active"]):
            raise InactiveUserError("User account is inactive.")

        user = _serialize_user(user_row)
        token, expires_in = create_access_token(user)
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": expires_in,
            "user": user,
        }


def seed_default_users(connection: sqlite3.Connection) -> None:
    settings = get_settings()
    defaults = [
        {
            "username": settings.default_admin_username,
            "password": settings.default_admin_password,
            "full_name": "System Administrator",
            "role": "admin",
        },
        {
            "username": settings.default_operator_username,
            "password": settings.default_operator_password,
            "full_name": "System Operator",
            "role": "operator",
        },
    ]

    for user in defaults:
        existing = find_user_by_username(connection, user["username"])
        if existing is not None:
            continue

        connection.execute(
            """
            INSERT INTO users (username, password_hash, full_name, role, is_active)
            VALUES (?, ?, ?, ?, 1)
            """,
            (
                user["username"],
                hash_password(user["password"]),
                user["full_name"],
                user["role"],
            ),
        )
