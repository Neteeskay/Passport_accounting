import json
import sqlite3

from app.core.api_utils import format_date_output, format_timestamp_output, parse_date_input
from app.db.session import get_connection


class CitizenNotFoundError(Exception):
    """Raised when linked citizen record does not exist."""


class StampNotFoundError(Exception):
    """Raised when stamp record does not exist."""


class StampValidationError(Exception):
    """Raised when stamp payload cannot be normalized."""


def _clean_text(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = value.strip()
    return cleaned or None


def _clean_details(details: dict | None) -> dict:
    if not isinstance(details, dict):
        return {}

    cleaned: dict = {}
    for key, value in details.items():
        if not isinstance(key, str):
            continue
        if isinstance(value, str):
            normalized = value.strip()
            cleaned[key] = normalized if normalized else None
        else:
            cleaned[key] = value

    return cleaned


def _resolve_stamp_authority(payload: dict) -> str:
    authority = _clean_text(payload.get("stamp_authority"))
    if authority:
        return authority

    details = _clean_details(payload.get("details"))
    fallback_candidates = (
        details.get("issuing_authority"),
        details.get("authority_name"),
        details.get("migration_department"),
        details.get("military_authority"),
        details.get("registry_office"),
        details.get("certified_by"),
        details.get("signed_by"),
        details.get("personal_code"),
    )

    for candidate in fallback_candidates:
        if isinstance(candidate, str) and candidate.strip():
            return candidate.strip()

    return "—"


def _normalize_stamp_payload(payload: dict) -> dict:
    try:
        parsed_date = parse_date_input(str(payload["stamp_placed_at"]))
    except ValueError as error:
        raise StampValidationError("Field 'stampPlacedAt' must contain a valid date.") from error
    if not parsed_date:
        raise StampValidationError("Field 'stampPlacedAt' must contain a valid date.")

    details = _clean_details(payload.get("details"))
    return {
        "stamp_category": _clean_text(payload.get("stamp_category")) or "history",
        "stamp_type": payload["stamp_type"].strip(),
        "stamp_placed_at": parsed_date,
        "stamp_authority": _resolve_stamp_authority(payload),
        "stamp_note": _clean_text(payload.get("stamp_note")),
        "is_active": bool(payload.get("is_active", False)),
        "details_json": json.dumps(details, ensure_ascii=False, separators=(",", ":")),
    }


def _serialize_stamp_row(row: sqlite3.Row) -> dict:
    stamp = dict(row)
    details_json = stamp.pop("details_json", "{}")
    try:
        stamp["details"] = json.loads(details_json or "{}")
    except json.JSONDecodeError:
        stamp["details"] = {}
    stamp["is_active"] = bool(stamp.get("is_active", 0))
    stamp["id"] = str(stamp["id"])
    stamp["citizen_id"] = str(stamp["citizen_id"])
    stamp["stamp_placed_at"] = format_date_output(stamp.get("stamp_placed_at"))
    stamp["created_at"] = format_timestamp_output(stamp.get("created_at"))
    stamp["updated_at"] = format_timestamp_output(stamp.get("updated_at"))
    return stamp


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
            stamp_category,
            stamp_type,
            stamp_placed_at,
            stamp_authority,
            stamp_note,
            is_active,
            details_json,
            created_at,
            updated_at
        FROM stamps
        WHERE id = ? AND citizen_id = ?
        """,
        (stamp_id, citizen_id),
    ).fetchone()

    if row is None:
        raise StampNotFoundError(
            f"Stamp with id={stamp_id} for citizen id={citizen_id} was not found."
        )

    return _serialize_stamp_row(row)


def list_stamps(citizen_id: int, stamp_category: str | None = None) -> list[dict]:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)
        if stamp_category:
            rows = connection.execute(
                """
                SELECT
                    id,
                    citizen_id,
                    stamp_category,
                    stamp_type,
                    stamp_placed_at,
                    stamp_authority,
                    stamp_note,
                    is_active,
                    details_json,
                    created_at,
                    updated_at
                FROM stamps
                WHERE citizen_id = ? AND stamp_category = ?
                ORDER BY stamp_placed_at ASC, id ASC
                """,
                (citizen_id, stamp_category),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT
                    id,
                    citizen_id,
                    stamp_category,
                    stamp_type,
                    stamp_placed_at,
                    stamp_authority,
                    stamp_note,
                    is_active,
                    details_json,
                    created_at,
                    updated_at
                FROM stamps
                WHERE citizen_id = ?
                ORDER BY stamp_placed_at ASC, id ASC
                """,
                (citizen_id,),
            ).fetchall()

        return [_serialize_stamp_row(row) for row in rows]


def get_stamp(citizen_id: int, stamp_id: int) -> dict:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)
        return _fetch_stamp(connection, citizen_id, stamp_id)


def create_stamp(citizen_id: int, payload: dict) -> dict:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)
        normalized_stamp = _normalize_stamp_payload(payload)

        cursor = connection.execute(
            """
            INSERT INTO stamps (
                citizen_id,
                stamp_category,
                stamp_type,
                stamp_placed_at,
                stamp_authority,
                stamp_note,
                is_active,
                details_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                citizen_id,
                normalized_stamp["stamp_category"],
                normalized_stamp["stamp_type"],
                normalized_stamp["stamp_placed_at"],
                normalized_stamp["stamp_authority"],
                normalized_stamp["stamp_note"],
                int(normalized_stamp["is_active"]),
                normalized_stamp["details_json"],
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
        normalized_stamp = _normalize_stamp_payload(payload)

        connection.execute(
            """
            UPDATE stamps
            SET
                stamp_category = ?,
                stamp_type = ?,
                stamp_placed_at = ?,
                stamp_authority = ?,
                stamp_note = ?,
                is_active = ?,
                details_json = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND citizen_id = ?
            """,
            (
                normalized_stamp["stamp_category"],
                normalized_stamp["stamp_type"],
                normalized_stamp["stamp_placed_at"],
                normalized_stamp["stamp_authority"],
                normalized_stamp["stamp_note"],
                int(normalized_stamp["is_active"]),
                normalized_stamp["details_json"],
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
