import sqlite3

from app.db.session import get_connection


class CitizenConflictError(Exception):
    """Raised when citizen passport data already exists."""


class RelatedUserNotFoundError(Exception):
    """Raised when created_by_user_id does not exist."""


class CitizenNotFoundError(Exception):
    """Raised when citizen record does not exist."""


SORT_COLUMNS = {
    "full_name": "c.last_name, c.first_name, c.middle_name",
    "birth_date": "c.birth_date",
    "created_at": "c.created_at",
    "updated_at": "c.updated_at",
    "passport_series": "c.passport_series, c.passport_number",
}


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
        raise CitizenNotFoundError(f"Citizen with id={citizen_id} was not found.")

    citizen = dict(row)
    citizen["full_name"] = _full_name(row)
    citizen["stamps"] = _fetch_stamps(connection, citizen_id)
    return citizen


def _normalize_list_filters(filters: dict | None) -> dict:
    raw_filters = filters or {}
    return {
        "search": _clean_text(raw_filters.get("search")),
        "birth_date": str(raw_filters["birth_date"]) if raw_filters.get("birth_date") else None,
        "registration_address": _clean_text(raw_filters.get("registration_address")),
        "passport_series": _clean_text(raw_filters.get("passport_series")),
        "passport_number": _clean_text(raw_filters.get("passport_number")),
        "sort_by": raw_filters.get("sort_by", "full_name"),
        "sort_order": str(raw_filters.get("sort_order", "asc")).lower(),
        "limit": int(raw_filters.get("limit", 50)),
        "offset": int(raw_filters.get("offset", 0)),
    }


def _build_citizen_list_query(filters: dict) -> tuple[str, list]:
    conditions: list[str] = []
    parameters: list = []

    if filters["search"]:
        search_value = f"%{filters['search']}%"
        conditions.append(
            """
            (
                c.last_name LIKE ?
                OR c.first_name LIKE ?
                OR IFNULL(c.middle_name, '') LIKE ?
                OR c.passport_series LIKE ?
                OR c.passport_number LIKE ?
            )
            """
        )
        parameters.extend([search_value] * 5)

    if filters["birth_date"]:
        conditions.append("c.birth_date = ?")
        parameters.append(filters["birth_date"])

    if filters["registration_address"]:
        conditions.append("c.registration_address LIKE ?")
        parameters.append(f"%{filters['registration_address']}%")

    if filters["passport_series"]:
        conditions.append("c.passport_series LIKE ?")
        parameters.append(f"%{filters['passport_series']}%")

    if filters["passport_number"]:
        conditions.append("c.passport_number LIKE ?")
        parameters.append(f"%{filters['passport_number']}%")

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    return where_clause, parameters


def _ensure_creator_exists(connection: sqlite3.Connection, creator_id: int | None) -> None:
    if creator_id is not None and not _user_exists(connection, creator_id):
        raise RelatedUserNotFoundError(f"User with id={creator_id} was not found.")


def _insert_stamps(connection: sqlite3.Connection, citizen_id: int, stamps: list[dict]) -> None:
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


def _handle_citizen_integrity_error(error: sqlite3.IntegrityError) -> None:
    message = str(error)
    if "UNIQUE constraint failed: citizens.passport_series, citizens.passport_number" in message:
        raise CitizenConflictError(
            "Citizen with the same passport series and number already exists."
        ) from error

    raise error


def create_citizen(payload: dict) -> dict:
    citizen_data = _normalize_citizen_payload(payload)
    stamps = citizen_data.pop("stamps")

    with get_connection() as connection:
        _ensure_creator_exists(connection, citizen_data["created_by_user_id"])

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
            _handle_citizen_integrity_error(error)

        citizen_id = int(cursor.lastrowid)
        _insert_stamps(connection, citizen_id, stamps)
        connection.commit()
        return _fetch_citizen(connection, citizen_id)


def list_citizens(filters: dict | None = None) -> dict:
    normalized_filters = _normalize_list_filters(filters)
    sort_by = normalized_filters["sort_by"]
    sort_order = normalized_filters["sort_order"]

    if sort_by not in SORT_COLUMNS:
        sort_by = "full_name"

    if sort_order not in {"asc", "desc"}:
        sort_order = "asc"

    where_clause, parameters = _build_citizen_list_query(normalized_filters)
    order_clause = f"ORDER BY {SORT_COLUMNS[sort_by]} {sort_order.upper()}"

    base_query = f"""
        FROM citizens c
        LEFT JOIN stamps s ON s.citizen_id = c.id
        {where_clause}
    """

    with get_connection() as connection:
        total_row = connection.execute(
            f"SELECT COUNT(DISTINCT c.id) AS total {base_query}",
            parameters,
        ).fetchone()
        total = int(total_row["total"]) if total_row else 0

        rows = connection.execute(
            f"""
            SELECT
                c.id,
                c.last_name,
                c.first_name,
                c.middle_name,
                c.birth_date,
                c.passport_series,
                c.passport_number,
                c.registration_address,
                c.photo_path,
                c.created_at,
                c.updated_at,
                COUNT(s.id) AS stamp_count
            {base_query}
            GROUP BY
                c.id,
                c.last_name,
                c.first_name,
                c.middle_name,
                c.birth_date,
                c.passport_series,
                c.passport_number,
                c.registration_address,
                c.photo_path,
                c.created_at,
                c.updated_at
            {order_clause}
            LIMIT ? OFFSET ?
            """,
            [*parameters, normalized_filters["limit"], normalized_filters["offset"]],
        ).fetchall()

        items: list[dict] = []
        for row in rows:
            item = dict(row)
            item["full_name"] = _full_name(row)
            item["stamp_count"] = int(item["stamp_count"])
            items.append(item)

        return {
            "total": total,
            "limit": normalized_filters["limit"],
            "offset": normalized_filters["offset"],
            "items": items,
        }


def update_citizen(citizen_id: int, payload: dict) -> dict:
    citizen_data = _normalize_citizen_payload(payload)
    stamps = citizen_data.pop("stamps")

    with get_connection() as connection:
        existing_row = connection.execute(
            "SELECT id FROM citizens WHERE id = ? LIMIT 1",
            (citizen_id,),
        ).fetchone()
        if existing_row is None:
            raise CitizenNotFoundError(f"Citizen with id={citizen_id} was not found.")

        _ensure_creator_exists(connection, citizen_data["created_by_user_id"])

        try:
            connection.execute(
                """
                UPDATE citizens
                SET
                    last_name = ?,
                    first_name = ?,
                    middle_name = ?,
                    birth_date = ?,
                    passport_series = ?,
                    passport_number = ?,
                    issue_date = ?,
                    issued_by = ?,
                    registration_address = ?,
                    notes = ?,
                    photo_path = ?,
                    created_by_user_id = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
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
                    citizen_id,
                ),
            )
        except sqlite3.IntegrityError as error:
            _handle_citizen_integrity_error(error)

        connection.execute("DELETE FROM stamps WHERE citizen_id = ?", (citizen_id,))
        _insert_stamps(connection, citizen_id, stamps)
        connection.commit()
        return _fetch_citizen(connection, citizen_id)
