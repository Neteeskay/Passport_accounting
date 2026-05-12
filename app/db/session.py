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


def _apply_runtime_migrations(connection: sqlite3.Connection) -> None:
    tables = {
        str(row["name"])
        for row in connection.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
            """
        ).fetchall()
    }

    if "citizens" in tables:
        citizen_columns = {
            str(row["name"])
            for row in connection.execute("PRAGMA table_info(citizens)").fetchall()
        }

        if "birth_place" not in citizen_columns:
            connection.execute("ALTER TABLE citizens ADD COLUMN birth_place TEXT NOT NULL DEFAULT ''")

        if "gender" not in citizen_columns:
            connection.execute(
                "ALTER TABLE citizens ADD COLUMN gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female'))"
            )

        if "department_code" not in citizen_columns:
            connection.execute(
                "ALTER TABLE citizens ADD COLUMN department_code TEXT NOT NULL DEFAULT ''"
            )

        if "passport_note" not in citizen_columns:
            connection.execute("ALTER TABLE citizens ADD COLUMN passport_note TEXT")

        if "phone" not in citizen_columns:
            connection.execute("ALTER TABLE citizens ADD COLUMN phone TEXT")

    if "stamps" not in tables:
        return

    stamp_columns = {
        str(row["name"])
        for row in connection.execute("PRAGMA table_info(stamps)").fetchall()
    }

    if "stamp_category" not in stamp_columns:
        connection.execute(
            "ALTER TABLE stamps ADD COLUMN stamp_category TEXT NOT NULL DEFAULT 'history'"
        )

    if "is_active" not in stamp_columns:
        connection.execute(
            "ALTER TABLE stamps ADD COLUMN is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1))"
        )

    if "details_json" not in stamp_columns:
        connection.execute(
            "ALTER TABLE stamps ADD COLUMN details_json TEXT NOT NULL DEFAULT '{}'"
        )

    if "updated_at" not in stamp_columns:
        connection.execute("ALTER TABLE stamps ADD COLUMN updated_at TEXT")
        connection.execute(
            "UPDATE stamps SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL"
        )

    connection.execute(
        "CREATE INDEX IF NOT EXISTS idx_stamps_category ON stamps(stamp_category)"
    )


def initialize_database() -> None:
    with get_connection() as connection:
        for statement in ALL_SCHEMA_STATEMENTS:
            connection.execute(statement)
        _apply_runtime_migrations(connection)
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
