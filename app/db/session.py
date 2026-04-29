import sqlite3
from pathlib import Path

from app.core.config import get_settings
from app.db.schema import ALL_SCHEMA_STATEMENTS
from app.services.auth import seed_default_users


def prepare_storage() -> None:
    settings = get_settings()
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)


def _parse_sqlite_path(database_url: str) -> Path:
    prefix = "sqlite:///"
    if not database_url.startswith(prefix):
        raise ValueError("Only sqlite:/// URLs are supported in the current project stage.")

    raw_path = database_url.removeprefix(prefix)
    return Path(raw_path)


def get_connection() -> sqlite3.Connection:
    settings = get_settings()
    database_path = _parse_sqlite_path(settings.database_url)
    database_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON;")
    return connection


def initialize_database() -> None:
    with get_connection() as connection:
        for statement in ALL_SCHEMA_STATEMENTS:
            connection.execute(statement)
        seed_default_users(connection)
        connection.commit()


def get_database_metadata() -> dict[str, str | list[str]]:
    settings = get_settings()
    database_path = _parse_sqlite_path(settings.database_url)

    table_names: list[str] = []
    if database_path.exists():
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
                """
            ).fetchall()
            table_names = [str(row["name"]) for row in rows]

    return {
        "database_url": settings.database_url,
        "database_path": str(database_path),
        "status": "initialized" if table_names else "not-initialized",
        "tables": table_names,
    }
