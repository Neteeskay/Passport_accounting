import sqlite3

from app.db.session import get_connection


class CitizenNotFoundError(Exception):
    """Raised when linked citizen record does not exist."""


class StampNotFoundError(Exception):
    """Raised when stamp record does not exist."""


def _clean_text(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = value.strip()
    return cleaned or None


def _ensure_citizen_exists(connection: sqlite3.Connection, citizen_id: int) -> None:
    row = connection.execute(
        "SELECT id FROM citizens WHERE id = ? LIMIT 1",
        (citizen_id,),
    ).fetchone()
    if row is None:
        raise CitizenNotFoundError(f"Citizen with id={citizen_id} was not found.")


def _touch_citizen(connection: sqlite3.Connection, citizen_id: int) -> None:
    connection.execute(
        "UPDATE citizens SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (citizen_id,),
    )


def _fetch_stamp(connection: sqlite3.Connection, citizen_id: int, stamp_id: int) -> dict:
    row = connection.execute(
        """
        SELECT
            id,
            citizen_id,
            stamp_type,
            stamp_placed_at,
            stamp_authority,
            stamp_note,
            created_at
        FROM stamps
        WHERE id = ? AND citizen_id = ?
        """,
        (stamp_id, citizen_id),
    ).fetchone()

    if row is None:
        raise StampNotFoundError(
            f"Stamp with id={stamp_id} for citizen id={citizen_id} was not found."
        )

    return dict(row)


def list_stamps(citizen_id: int) -> list[dict]:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)
        rows = connection.execute(
            """
            SELECT
                id,
                citizen_id,
                stamp_type,
                stamp_placed_at,
                stamp_authority,
                stamp_note,
                created_at
            FROM stamps
            WHERE citizen_id = ?
            ORDER BY stamp_placed_at ASC, id ASC
            """,
            (citizen_id,),
        ).fetchall()

        return [dict(row) for row in rows]


def get_stamp(citizen_id: int, stamp_id: int) -> dict:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)
        return _fetch_stamp(connection, citizen_id, stamp_id)


def create_stamp(citizen_id: int, payload: dict) -> dict:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)

        cursor = connection.execute(
            """
            INSERT INTO stamps (
                citizen_id,
                stamp_type,
                stamp_placed_at,
                stamp_authority,
                stamp_note
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                citizen_id,
                payload["stamp_type"].strip(),
                str(payload["stamp_placed_at"]),
                payload["stamp_authority"].strip(),
                _clean_text(payload.get("stamp_note")),
            ),
        )

        stamp_id = int(cursor.lastrowid)
        _touch_citizen(connection, citizen_id)
        connection.commit()
        return _fetch_stamp(connection, citizen_id, stamp_id)


def update_stamp(citizen_id: int, stamp_id: int, payload: dict) -> dict:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)
        _fetch_stamp(connection, citizen_id, stamp_id)

        connection.execute(
            """
            UPDATE stamps
            SET
                stamp_type = ?,
                stamp_placed_at = ?,
                stamp_authority = ?,
                stamp_note = ?
            WHERE id = ? AND citizen_id = ?
            """,
            (
                payload["stamp_type"].strip(),
                str(payload["stamp_placed_at"]),
                payload["stamp_authority"].strip(),
                _clean_text(payload.get("stamp_note")),
                stamp_id,
                citizen_id,
            ),
        )

        _touch_citizen(connection, citizen_id)
        connection.commit()
        return _fetch_stamp(connection, citizen_id, stamp_id)


def delete_stamp(citizen_id: int, stamp_id: int) -> None:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)
        _fetch_stamp(connection, citizen_id, stamp_id)
        connection.execute(
            "DELETE FROM stamps WHERE id = ? AND citizen_id = ?",
            (stamp_id, citizen_id),
        )
        _touch_citizen(connection, citizen_id)
        connection.commit()
