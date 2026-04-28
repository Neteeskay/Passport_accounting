import sqlite3

from app.db.session import get_connection


class CitizenConflictError(Exception):
    """Raised when citizen passport data already exists."""


class RelatedUserNotFoundError(Exception):
    """Raised when created_by_user_id does not exist."""


def _clean_text(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = value.strip()
    return cleaned or None


def _normalize_citizen_payload(payload: dict) -> dict:
    return {
        "last_name": payload["last_name"].strip(),
        "first_name": payload["first_name"].strip(),
        "middle_name": _clean_text(payload.get("middle_name")),
        "birth_date": str(payload["birth_date"]),
        "passport_series": payload["passport_series"].strip(),
        "passport_number": payload["passport_number"].strip(),
        "issue_date": str(payload["issue_date"]) if payload.get("issue_date") else None,
        "issued_by": _clean_text(payload.get("issued_by")),
        "registration_address": payload["registration_address"].strip(),
        "notes": _clean_text(payload.get("notes")),
        "photo_path": _clean_text(payload.get("photo_path")),
        "created_by_user_id": payload.get("created_by_user_id"),
        "stamps": payload.get("stamps", []),
    }


def _full_name(row: sqlite3.Row) -> str:
    return " ".join(
        part for part in [row["last_name"], row["first_name"], row["middle_name"]] if part
    )


def _user_exists(connection: sqlite3.Connection, user_id: int) -> bool:
    row = connection.execute("SELECT 1 FROM users WHERE id = ? LIMIT 1", (user_id,)).fetchone()
    return row is not None


def _fetch_stamps(connection: sqlite3.Connection, citizen_id: int) -> list[dict]:
    rows = connection.execute(
        """
        SELECT id, stamp_type, stamp_placed_at, stamp_authority, stamp_note, created_at
        FROM stamps
        WHERE citizen_id = ?
        ORDER BY id ASC
        """,
        (citizen_id,),
    ).fetchall()

    return [dict(row) for row in rows]


def _fetch_citizen(connection: sqlite3.Connection, citizen_id: int) -> dict:
    row = connection.execute(
        """
        SELECT
            id,
            last_name,
            first_name,
            middle_name,
            birth_date,
            passport_series,
            passport_number,
            issue_date,
            issued_by,
            registration_address,
            notes,
            photo_path,
            created_by_user_id,
            created_at,
            updated_at
        FROM citizens
        WHERE id = ?
        """,
        (citizen_id,),
    ).fetchone()

    if row is None:
        raise LookupError(f"Citizen with id={citizen_id} was not found.")

    citizen = dict(row)
    citizen["full_name"] = _full_name(row)
    citizen["stamps"] = _fetch_stamps(connection, citizen_id)
    return citizen


def create_citizen(payload: dict) -> dict:
    citizen_data = _normalize_citizen_payload(payload)
    stamps = citizen_data.pop("stamps")

    with get_connection() as connection:
        creator_id = citizen_data["created_by_user_id"]
        if creator_id is not None and not _user_exists(connection, creator_id):
            raise RelatedUserNotFoundError(f"User with id={creator_id} was not found.")

        try:
            cursor = connection.execute(
                """
                INSERT INTO citizens (
                    last_name,
                    first_name,
                    middle_name,
                    birth_date,
                    passport_series,
                    passport_number,
                    issue_date,
                    issued_by,
                    registration_address,
                    notes,
                    photo_path,
                    created_by_user_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    citizen_data["last_name"],
                    citizen_data["first_name"],
                    citizen_data["middle_name"],
                    citizen_data["birth_date"],
                    citizen_data["passport_series"],
                    citizen_data["passport_number"],
                    citizen_data["issue_date"],
                    citizen_data["issued_by"],
                    citizen_data["registration_address"],
                    citizen_data["notes"],
                    citizen_data["photo_path"],
                    citizen_data["created_by_user_id"],
                ),
            )
        except sqlite3.IntegrityError as error:
            message = str(error)
            if "UNIQUE constraint failed: citizens.passport_series, citizens.passport_number" in message:
                raise CitizenConflictError(
                    "Citizen with the same passport series and number already exists."
                ) from error
            raise

        citizen_id = int(cursor.lastrowid)

        for stamp in stamps:
            connection.execute(
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
                    stamp["stamp_type"].strip(),
                    str(stamp["stamp_placed_at"]),
                    stamp["stamp_authority"].strip(),
                    _clean_text(stamp.get("stamp_note")),
                ),
            )

        connection.commit()
        return _fetch_citizen(connection, citizen_id)
