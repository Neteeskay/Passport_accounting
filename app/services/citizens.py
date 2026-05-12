from collections import defaultdict
import json
import sqlite3
from typing import Any

from app.core.api_utils import format_date_output, format_timestamp_output, parse_date_input
from app.db.session import get_connection


class CitizenNotFoundError(Exception):
    """Raised when a citizen record does not exist."""


class CitizenConflictError(Exception):
    """Raised when passport data conflicts with an existing citizen."""


class RelatedUserNotFoundError(Exception):
    """Raised when a linked user does not exist."""


class CitizenValidationError(Exception):
    """Raised when request payload cannot be normalized."""


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _clean_optional_text(value: Any) -> str | None:
    cleaned = _clean_text(value)
    return cleaned or None


def _parse_required_date(field_name: str, value: Any) -> str:
    try:
        parsed = parse_date_input(_clean_text(value))
    except ValueError as error:
        raise CitizenValidationError(f"Field '{field_name}' must contain a valid date.") from error
    if not parsed:
        raise CitizenValidationError(f"Field '{field_name}' must contain a valid date.")
    return parsed


def _parse_optional_date(field_name: str, value: Any) -> str | None:
    cleaned = _clean_text(value)
    if not cleaned:
        return None

    try:
        parsed = parse_date_input(cleaned)
    except ValueError as error:
        raise CitizenValidationError(f"Field '{field_name}' must contain a valid date.") from error
    if not parsed:
        raise CitizenValidationError(f"Field '{field_name}' must contain a valid date.")
    return parsed


def _ensure_user_exists(connection: sqlite3.Connection, user_id: int | None) -> None:
    if user_id is None:
        return

    row = connection.execute(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        (user_id,),
    ).fetchone()
    if row is None:
        raise RelatedUserNotFoundError(f"User with id={user_id} was not found.")


def _ensure_citizen_exists(connection: sqlite3.Connection, citizen_id: int) -> sqlite3.Row:
    row = connection.execute(
        """
        SELECT
            id,
            last_name,
            first_name,
            middle_name,
            birth_date,
            birth_place,
            gender,
            passport_series,
            passport_number,
            issue_date,
            issued_by,
            department_code,
            passport_note,
            registration_address,
            phone,
            notes,
            photo_path,
            created_by_user_id,
            created_at,
            updated_at
        FROM citizens
        WHERE id = ?
        LIMIT 1
        """,
        (citizen_id,),
    ).fetchone()
    if row is None:
        raise CitizenNotFoundError(f"Citizen with id={citizen_id} was not found.")
    return row


def _check_passport_conflict(
    connection: sqlite3.Connection,
    passport_series: str,
    passport_number: str,
    excluded_citizen_id: int | None = None,
) -> None:
    params: list[Any] = [passport_series, passport_number]
    query = """
        SELECT id
        FROM citizens
        WHERE passport_series = ? AND passport_number = ?
    """
    if excluded_citizen_id is not None:
        query += " AND id != ?"
        params.append(excluded_citizen_id)
    query += " LIMIT 1"

    row = connection.execute(query, tuple(params)).fetchone()
    if row is not None:
        raise CitizenConflictError(
            "Citizen with the same passport series and number already exists."
        )


def _build_registration_address(registration_stamps: list[dict[str, Any]]) -> str:
    if not registration_stamps:
        return ""

    active_registration = next(
        (stamp for stamp in reversed(registration_stamps) if stamp["type"] == "registration"),
        registration_stamps[-1],
    )

    parts = [
        active_registration["locality"],
        active_registration["settlement"],
        f"ул. {active_registration['street']}" if active_registration["street"] else "",
        f"д.{active_registration['house']}" if active_registration["house"] else "",
        f"кв.{active_registration['apartment']}" if active_registration["apartment"] else "",
    ]
    return ", ".join(part for part in parts if part)


def _normalize_registration_stamps(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for record in records:
        normalized.append(
            {
                "type": _clean_text(record.get("type")) or "registration",
                "date": _parse_required_date("registrationStamps.date", record.get("date")),
                "region": _clean_text(record.get("region")),
                "district": _clean_text(record.get("district")),
                "locality": _clean_text(record.get("locality")),
                "settlement": _clean_text(record.get("settlement")),
                "street": _clean_text(record.get("street")),
                "house": _clean_text(record.get("house")),
                "apartment": _clean_text(record.get("apartment")),
                "authority": _clean_text(record.get("authority")),
                "department_code": _clean_text(record.get("department_code") or record.get("departmentCode")),
                "certifier": _clean_text(record.get("certifier")),
            }
        )
    return normalized


def _normalize_children(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for record in records:
        normalized.append(
            {
                "last_name": _clean_text(record.get("last_name") or record.get("lastName")),
                "first_name": _clean_text(record.get("first_name") or record.get("firstName")),
                "middle_name": _clean_text(record.get("middle_name") or record.get("middleName")),
                "gender": _clean_text(record.get("gender")) or "male",
                "birth_date": _parse_required_date("children.birthDate", record.get("birth_date") or record.get("birthDate")),
                "personal_mark": _clean_text(record.get("personal_mark") or record.get("personalMark")),
            }
        )
    return normalized


def _normalize_marriage_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for record in records:
        normalized.append(
            {
                "status": _clean_text(record.get("status")) or "registered",
                "date": _parse_required_date("marriageRecords.date", record.get("date")),
                "spouse_last_name": _clean_text(record.get("spouse_last_name") or record.get("spouseLastName")),
                "spouse_first_name": _clean_text(record.get("spouse_first_name") or record.get("spouseFirstName")),
                "spouse_middle_name": _clean_text(record.get("spouse_middle_name") or record.get("spouseMiddleName")),
                "spouse_birth_date": _parse_optional_date(
                    "marriageRecords.spouseBirthDate",
                    record.get("spouse_birth_date") or record.get("spouseBirthDate"),
                ),
                "authority": _clean_text(record.get("authority")),
                "act_record_number": _clean_text(record.get("act_record_number") or record.get("actRecordNumber")),
                "certifier": _clean_text(record.get("certifier")),
            }
        )
    return normalized


def _normalize_military_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for record in records:
        normalized.append(
            {
                "status": _clean_text(record.get("status")) or "liable",
                "authority": _clean_text(record.get("authority")),
                "signed_by": _clean_text(record.get("signed_by") or record.get("signedBy")),
                "date": _parse_required_date("militaryRecords.date", record.get("date")),
            }
        )
    return normalized


def _normalize_foreign_passports(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for record in records:
        normalized.append(
            {
                "issue_date": _parse_required_date(
                    "foreignPassports.issueDate",
                    record.get("issue_date") or record.get("issueDate"),
                ),
                "series": _clean_text(record.get("series")),
                "number": _clean_text(record.get("number")),
                "authority": _clean_text(record.get("authority")),
                "note": _clean_text(record.get("note")),
            }
        )
    return normalized


def _normalize_name_changes(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for record in records:
        normalized.append(
            {
                "reason": _clean_text(record.get("reason")),
                "document_number": _clean_text(record.get("document_number") or record.get("documentNumber")),
                "previous_last_name": _clean_text(record.get("previous_last_name") or record.get("previousLastName")),
                "previous_first_name": _clean_text(record.get("previous_first_name") or record.get("previousFirstName")),
                "previous_middle_name": _clean_text(record.get("previous_middle_name") or record.get("previousMiddleName")),
                "new_last_name": _clean_text(record.get("new_last_name") or record.get("newLastName")),
                "new_first_name": _clean_text(record.get("new_first_name") or record.get("newFirstName")),
                "new_middle_name": _clean_text(record.get("new_middle_name") or record.get("newMiddleName")),
                "date": _parse_required_date("nameChanges.date", record.get("date")),
                "authority": _clean_text(record.get("authority")),
                "note": _clean_text(record.get("note")),
            }
        )
    return normalized


def _normalize_history_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for record in records:
        normalized.append(
            {
                "event": _clean_text(record.get("event")),
                "is_current": bool(record.get("is_current") if "is_current" in record else record.get("isCurrent", False)),
                "series": _clean_text(record.get("series")),
                "number": _clean_text(record.get("number")),
                "department_code": _clean_text(record.get("department_code") or record.get("departmentCode")),
                "issue_date": _parse_required_date(
                    "historyRecords.issueDate",
                    record.get("issue_date") or record.get("issueDate"),
                ),
                "authority": _clean_text(record.get("authority")),
                "note": _clean_text(record.get("note")),
            }
        )
    return normalized


def _normalize_citizen_payload(payload: dict[str, Any], current_user_id: int | None) -> dict[str, Any]:
    registration_stamps = _normalize_registration_stamps(payload.get("registration_stamps", []))
    children = _normalize_children(payload.get("children", []))
    marriage_records = _normalize_marriage_records(payload.get("marriage_records", []))
    military_records = _normalize_military_records(payload.get("military_records", []))
    foreign_passports = _normalize_foreign_passports(payload.get("foreign_passports", []))
    name_changes = _normalize_name_changes(payload.get("name_changes", []))
    history_records = _normalize_history_records(payload.get("history_records", []))

    return {
        "last_name": _clean_text(payload.get("last_name")),
        "first_name": _clean_text(payload.get("first_name")),
        "middle_name": _clean_text(payload.get("middle_name")),
        "birth_date": _parse_required_date("birthDate", payload.get("birth_date")),
        "birth_place": _clean_text(payload.get("birth_place")),
        "gender": _clean_text(payload.get("gender")) or "male",
        "passport_series": _clean_text(payload.get("passport_series")),
        "passport_number": _clean_text(payload.get("passport_number")),
        "passport_issued_by": _clean_text(payload.get("passport_issued_by")),
        "passport_issued_date": _parse_required_date("passportIssuedDate", payload.get("passport_issued_date")),
        "department_code": _clean_text(payload.get("department_code")),
        "passport_note": _clean_text(payload.get("passport_note")),
        "phone": _clean_text(payload.get("phone")),
        "photo_url": _clean_text(payload.get("photo_url")),
        "registration_stamps": registration_stamps,
        "children": children,
        "marriage_records": marriage_records,
        "military_records": military_records,
        "foreign_passports": foreign_passports,
        "name_changes": name_changes,
        "history_records": history_records,
        "registration_address": _build_registration_address(registration_stamps),
        "created_by_user_id": current_user_id,
    }


def _build_stamp_rows(payload: dict[str, Any]) -> list[dict[str, Any]]:
    stamp_rows: list[dict[str, Any]] = []

    for record in payload["registration_stamps"]:
        stamp_rows.append(
            {
                "stamp_category": "registration",
                "stamp_type": record["type"],
                "stamp_placed_at": record["date"],
                "stamp_authority": record["authority"] or "—",
                "stamp_note": record["certifier"] or None,
                "is_active": record["type"] == "registration",
                "details_json": {
                    "region": record["region"],
                    "district": record["district"],
                    "locality": record["locality"],
                    "settlement": record["settlement"],
                    "street": record["street"],
                    "house": record["house"],
                    "apartment": record["apartment"],
                    "department_code": record["department_code"],
                    "certifier": record["certifier"],
                },
            }
        )

    for record in payload["children"]:
        stamp_rows.append(
            {
                "stamp_category": "children",
                "stamp_type": "child",
                "stamp_placed_at": record["birth_date"],
                "stamp_authority": record["personal_mark"] or "—",
                "stamp_note": None,
                "is_active": False,
                "details_json": {
                    "last_name": record["last_name"],
                    "first_name": record["first_name"],
                    "middle_name": record["middle_name"],
                    "gender": record["gender"],
                    "personal_mark": record["personal_mark"],
                },
            }
        )

    for record in payload["marriage_records"]:
        stamp_rows.append(
            {
                "stamp_category": "marriage",
                "stamp_type": record["status"],
                "stamp_placed_at": record["date"],
                "stamp_authority": record["authority"] or "—",
                "stamp_note": record["act_record_number"] or None,
                "is_active": record["status"] == "registered",
                "details_json": {
                    "spouse_last_name": record["spouse_last_name"],
                    "spouse_first_name": record["spouse_first_name"],
                    "spouse_middle_name": record["spouse_middle_name"],
                    "spouse_birth_date": record["spouse_birth_date"] or "",
                    "act_record_number": record["act_record_number"],
                    "certifier": record["certifier"],
                },
            }
        )

    for record in payload["military_records"]:
        stamp_rows.append(
            {
                "stamp_category": "military",
                "stamp_type": record["status"],
                "stamp_placed_at": record["date"],
                "stamp_authority": record["authority"] or "—",
                "stamp_note": record["signed_by"] or None,
                "is_active": record["status"] == "liable",
                "details_json": {
                    "signed_by": record["signed_by"],
                },
            }
        )

    for record in payload["foreign_passports"]:
        stamp_rows.append(
            {
                "stamp_category": "foreign_passport",
                "stamp_type": "foreign_passport",
                "stamp_placed_at": record["issue_date"],
                "stamp_authority": record["authority"] or "—",
                "stamp_note": record["note"] or None,
                "is_active": False,
                "details_json": {
                    "series": record["series"],
                    "number": record["number"],
                    "note": record["note"],
                },
            }
        )

    for record in payload["name_changes"]:
        stamp_rows.append(
            {
                "stamp_category": "name_change",
                "stamp_type": "name_change",
                "stamp_placed_at": record["date"],
                "stamp_authority": record["authority"] or "—",
                "stamp_note": record["note"] or None,
                "is_active": False,
                "details_json": {
                    "reason": record["reason"],
                    "document_number": record["document_number"],
                    "previous_last_name": record["previous_last_name"],
                    "previous_first_name": record["previous_first_name"],
                    "previous_middle_name": record["previous_middle_name"],
                    "new_last_name": record["new_last_name"],
                    "new_first_name": record["new_first_name"],
                    "new_middle_name": record["new_middle_name"],
                    "note": record["note"],
                },
            }
        )

    for record in payload["history_records"]:
        stamp_rows.append(
            {
                "stamp_category": "history",
                "stamp_type": record["event"] or "history",
                "stamp_placed_at": record["issue_date"],
                "stamp_authority": record["authority"] or "—",
                "stamp_note": record["note"] or None,
                "is_active": record["is_current"],
                "details_json": {
                    "series": record["series"],
                    "number": record["number"],
                    "department_code": record["department_code"],
                    "issue_date": record["issue_date"],
                    "note": record["note"],
                },
            }
        )

    return stamp_rows


def _insert_stamp_rows(
    connection: sqlite3.Connection,
    citizen_id: int,
    stamp_rows: list[dict[str, Any]],
) -> None:
    for stamp in stamp_rows:
        connection.execute(
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
                stamp["stamp_category"],
                stamp["stamp_type"],
                stamp["stamp_placed_at"],
                stamp["stamp_authority"],
                stamp["stamp_note"],
                int(stamp["is_active"]),
                json.dumps(stamp["details_json"], ensure_ascii=False),
            ),
        )


def _fetch_stamp_rows_for_citizens(
    connection: sqlite3.Connection,
    citizen_ids: list[int],
) -> dict[int, list[dict[str, Any]]]:
    grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
    if not citizen_ids:
        return grouped

    placeholders = ", ".join("?" for _ in citizen_ids)
    rows = connection.execute(
        f"""
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
        WHERE citizen_id IN ({placeholders})
        ORDER BY stamp_placed_at ASC, id ASC
        """,
        tuple(citizen_ids),
    ).fetchall()

    import json

    for row in rows:
        details: dict[str, Any]
        try:
            details = json.loads(row["details_json"] or "{}")
        except json.JSONDecodeError:
            details = {}

        grouped[int(row["citizen_id"])].append(
            {
                "id": int(row["id"]),
                "citizen_id": int(row["citizen_id"]),
                "stamp_category": str(row["stamp_category"]),
                "stamp_type": str(row["stamp_type"]),
                "stamp_placed_at": str(row["stamp_placed_at"]),
                "stamp_authority": str(row["stamp_authority"]),
                "stamp_note": row["stamp_note"],
                "is_active": bool(row["is_active"]),
                "details": details,
                "created_at": str(row["created_at"]),
                "updated_at": str(row["updated_at"]),
            }
        )

    return grouped


def _pluralize_children(count: int) -> str:
    if count % 10 == 1 and count % 100 != 11:
        suffix = "ребёнок"
    elif count % 10 in {2, 3, 4} and count % 100 not in {12, 13, 14}:
        suffix = "ребёнка"
    else:
        suffix = "детей"
    return f"{count} {suffix}"


def _pluralize_passports(count: int) -> str:
    return f"{count} пас."


def _build_preview_stamps(
    children: list[dict[str, Any]],
    marriage_records: list[dict[str, Any]],
    military_records: list[dict[str, Any]],
    history_records: list[dict[str, Any]],
    foreign_passports: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    preview: list[dict[str, Any]] = []

    if children:
        preview.append(
            {
                "id": "children-preview",
                "type": "marital_status",
                "date": children[0]["birth_date"],
                "authority": "",
                "comment": _pluralize_children(len(children)),
            }
        )

    if marriage_records:
        record = marriage_records[0]
        preview.append(
            {
                "id": "marriage-preview",
                "type": "marital_status",
                "date": record["date"],
                "authority": record["authority"],
                "comment": "Брак" if record["status"] == "registered" else "Развод",
            }
        )

    if military_records:
        record = military_records[0]
        preview.append(
            {
                "id": "military-preview",
                "type": "military_duty",
                "date": record["date"],
                "authority": record["authority"],
                "comment": "Воинская",
            }
        )

    if history_records:
        record = history_records[0]
        preview.append(
            {
                "id": "history-preview",
                "type": "foreign_passport",
                "date": record["issue_date"],
                "authority": record["authority"],
                "comment": _pluralize_passports(len(history_records)),
            }
        )
    elif foreign_passports:
        record = foreign_passports[0]
        preview.append(
            {
                "id": "foreign-preview",
                "type": "foreign_passport",
                "date": record["issue_date"],
                "authority": record["authority"],
                "comment": "Загран",
            }
        )

    return preview[:4]


def _serialize_registration_stamp(stamp: dict[str, Any]) -> dict[str, Any]:
    details = stamp["details"]
    return {
        "id": str(stamp["id"]),
        "type": "deregistration" if stamp["stamp_type"] == "deregistration" else "registration",
        "date": format_date_output(stamp["stamp_placed_at"]),
        "region": _clean_text(details.get("region")),
        "district": _clean_text(details.get("district")),
        "locality": _clean_text(details.get("locality")),
        "settlement": _clean_text(details.get("settlement")),
        "street": _clean_text(details.get("street")),
        "house": _clean_text(details.get("house")),
        "apartment": _clean_text(details.get("apartment")),
        "authority": stamp["stamp_authority"],
        "department_code": _clean_text(details.get("department_code")),
        "certifier": _clean_text(details.get("certifier") or stamp.get("stamp_note")),
    }


def _serialize_child_record(stamp: dict[str, Any]) -> dict[str, Any]:
    details = stamp["details"]
    return {
        "id": str(stamp["id"]),
        "last_name": _clean_text(details.get("last_name")),
        "first_name": _clean_text(details.get("first_name")),
        "middle_name": _clean_text(details.get("middle_name")),
        "gender": _clean_text(details.get("gender")) or "male",
        "birth_date": format_date_output(stamp["stamp_placed_at"]),
        "personal_mark": _clean_text(details.get("personal_mark") or stamp["stamp_authority"]),
    }


def _serialize_marriage_record(stamp: dict[str, Any]) -> dict[str, Any]:
    details = stamp["details"]
    return {
        "id": str(stamp["id"]),
        "status": "dissolved" if stamp["stamp_type"] == "dissolved" else "registered",
        "date": format_date_output(stamp["stamp_placed_at"]),
        "spouse_last_name": _clean_text(details.get("spouse_last_name")),
        "spouse_first_name": _clean_text(details.get("spouse_first_name")),
        "spouse_middle_name": _clean_text(details.get("spouse_middle_name")),
        "spouse_birth_date": format_date_output(_clean_optional_text(details.get("spouse_birth_date"))),
        "authority": stamp["stamp_authority"],
        "act_record_number": _clean_text(details.get("act_record_number") or stamp.get("stamp_note")),
        "certifier": _clean_text(details.get("certifier")),
    }


def _serialize_military_record(stamp: dict[str, Any]) -> dict[str, Any]:
    details = stamp["details"]
    return {
        "id": str(stamp["id"]),
        "status": "exempt" if stamp["stamp_type"] == "exempt" else "liable",
        "authority": stamp["stamp_authority"],
        "signed_by": _clean_text(details.get("signed_by") or stamp.get("stamp_note")),
        "date": format_date_output(stamp["stamp_placed_at"]),
    }


def _serialize_foreign_passport(stamp: dict[str, Any]) -> dict[str, Any]:
    details = stamp["details"]
    return {
        "id": str(stamp["id"]),
        "issue_date": format_date_output(stamp["stamp_placed_at"]),
        "series": _clean_text(details.get("series")),
        "number": _clean_text(details.get("number")),
        "authority": stamp["stamp_authority"],
        "note": _clean_text(details.get("note") or stamp.get("stamp_note")),
    }


def _serialize_name_change(stamp: dict[str, Any]) -> dict[str, Any]:
    details = stamp["details"]
    return {
        "id": str(stamp["id"]),
        "reason": _clean_text(details.get("reason")),
        "document_number": _clean_text(details.get("document_number")),
        "previous_last_name": _clean_text(details.get("previous_last_name")),
        "previous_first_name": _clean_text(details.get("previous_first_name")),
        "previous_middle_name": _clean_text(details.get("previous_middle_name")),
        "new_last_name": _clean_text(details.get("new_last_name")),
        "new_first_name": _clean_text(details.get("new_first_name")),
        "new_middle_name": _clean_text(details.get("new_middle_name")),
        "date": format_date_output(stamp["stamp_placed_at"]),
        "authority": stamp["stamp_authority"],
        "note": _clean_text(details.get("note") or stamp.get("stamp_note")),
    }


def _serialize_history_record(stamp: dict[str, Any]) -> dict[str, Any]:
    details = stamp["details"]
    return {
        "id": str(stamp["id"]),
        "event": stamp["stamp_type"],
        "is_current": bool(stamp["is_active"]),
        "series": _clean_text(details.get("series")),
        "number": _clean_text(details.get("number")),
        "department_code": _clean_text(details.get("department_code")),
        "issue_date": format_date_output(details.get("issue_date") or stamp["stamp_placed_at"]),
        "authority": stamp["stamp_authority"],
        "note": _clean_text(details.get("note") or stamp.get("stamp_note")),
    }


def _serialize_citizen(row: sqlite3.Row, stamp_rows: list[dict[str, Any]]) -> dict[str, Any]:
    registration_stamps = [
        _serialize_registration_stamp(stamp)
        for stamp in stamp_rows
        if stamp["stamp_category"] == "registration"
    ]
    children = [
        _serialize_child_record(stamp)
        for stamp in stamp_rows
        if stamp["stamp_category"] == "children"
    ]
    marriage_records = [
        _serialize_marriage_record(stamp)
        for stamp in stamp_rows
        if stamp["stamp_category"] == "marriage"
    ]
    military_records = [
        _serialize_military_record(stamp)
        for stamp in stamp_rows
        if stamp["stamp_category"] == "military"
    ]
    foreign_passports = [
        _serialize_foreign_passport(stamp)
        for stamp in stamp_rows
        if stamp["stamp_category"] == "foreign_passport"
    ]
    name_changes = [
        _serialize_name_change(stamp)
        for stamp in stamp_rows
        if stamp["stamp_category"] == "name_change"
    ]
    history_records = [
        _serialize_history_record(stamp)
        for stamp in stamp_rows
        if stamp["stamp_category"] == "history"
    ]

    return {
        "id": str(row["id"]),
        "last_name": str(row["last_name"]),
        "first_name": str(row["first_name"]),
        "middle_name": _clean_text(row["middle_name"]),
        "birth_date": str(row["birth_date"]),
        "birth_place": _clean_text(row["birth_place"]),
        "gender": str(row["gender"]),
        "passport_series": str(row["passport_series"]),
        "passport_number": str(row["passport_number"]),
        "passport_issued_by": _clean_text(row["issued_by"]),
        "passport_issued_date": _clean_text(row["issue_date"]),
        "department_code": _clean_text(row["department_code"]),
        "passport_note": _clean_text(row["passport_note"] or row["notes"]),
        "registration_address": _clean_text(row["registration_address"]),
        "phone": _clean_text(row["phone"]),
        "photo_url": _clean_text(row["photo_path"]),
        "stamps": _build_preview_stamps(
            children,
            marriage_records,
            military_records,
            history_records,
            foreign_passports,
        ),
        "registration_stamps": registration_stamps,
        "children": children,
        "marriage_records": marriage_records,
        "military_records": military_records,
        "foreign_passports": foreign_passports,
        "name_changes": name_changes,
        "history_records": history_records,
        "created_at": format_timestamp_output(str(row["created_at"])),
        "updated_at": format_timestamp_output(str(row["updated_at"])),
    }


def _build_filters(filters: dict[str, Any] | None) -> tuple[str, list[Any]]:
    if not filters:
        return "", []

    clauses: list[str] = []
    params: list[Any] = []

    query = _clean_text(filters.get("query") or filters.get("search"))
    if query:
        lowered = f"%{query.lower()}%"
        search_clauses = [
            "lower(last_name || ' ' || first_name || ' ' || coalesce(middle_name, '')) LIKE ?",
            "lower(passport_series || ' ' || passport_number) LIKE ?",
            "lower(registration_address) LIKE ?",
            "lower(birth_place) LIKE ?",
        ]
        search_params: list[Any] = [lowered, lowered, lowered, lowered]
        try:
            parsed_query_date = parse_date_input(query)
        except ValueError:
            parsed_query_date = None
        if parsed_query_date:
            search_clauses.append("birth_date = ?")
            search_params.append(parsed_query_date)
        clauses.append("(" + " OR ".join(search_clauses) + ")")
        params.extend(search_params)

    gender = _clean_text(filters.get("gender"))
    if gender and gender != "all":
        clauses.append("gender = ?")
        params.append(gender)

    birth_date_from = _clean_text(filters.get("birth_date_from") or filters.get("birthDateFrom"))
    if birth_date_from:
        clauses.append("birth_date >= ?")
        params.append(_parse_required_date("birthDateFrom", birth_date_from))

    birth_date_to = _clean_text(filters.get("birth_date_to") or filters.get("birthDateTo"))
    if birth_date_to:
        clauses.append("birth_date <= ?")
        params.append(_parse_required_date("birthDateTo", birth_date_to))

    passport = _clean_text(filters.get("passport"))
    if passport:
        clauses.append("lower(passport_series || ' ' || passport_number) LIKE ?")
        params.append(f"%{passport.lower()}%")

    address = _clean_text(filters.get("registration_address") or filters.get("address"))
    if address:
        clauses.append("lower(registration_address) LIKE ?")
        params.append(f"%{address.lower()}%")

    if not clauses:
        return "", []

    return "WHERE " + " AND ".join(f"({clause.strip()})" for clause in clauses), params


def list_citizens(filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    where_sql, params = _build_filters(filters)

    with get_connection() as connection:
        rows = connection.execute(
            f"""
            SELECT
                id,
                last_name,
                first_name,
                middle_name,
                birth_date,
                birth_place,
                gender,
                passport_series,
                passport_number,
                issue_date,
                issued_by,
                department_code,
                passport_note,
                registration_address,
                phone,
                notes,
                photo_path,
                created_by_user_id,
                created_at,
                updated_at
            FROM citizens
            {where_sql}
            ORDER BY updated_at DESC, id DESC
            """,
            tuple(params),
        ).fetchall()

        citizen_ids = [int(row["id"]) for row in rows]
        grouped_stamps = _fetch_stamp_rows_for_citizens(connection, citizen_ids)
        return [_serialize_citizen(row, grouped_stamps.get(int(row["id"]), [])) for row in rows]


def get_citizen_stats(filters: dict[str, Any] | None = None) -> dict[str, int]:
    citizens = list_citizens(filters)
    return {
        "total": len(citizens),
        "male": sum(1 for citizen in citizens if citizen["gender"] == "male"),
        "female": sum(1 for citizen in citizens if citizen["gender"] == "female"),
    }


def get_citizen(citizen_id: int) -> dict[str, Any]:
    with get_connection() as connection:
        row = _ensure_citizen_exists(connection, citizen_id)
        grouped_stamps = _fetch_stamp_rows_for_citizens(connection, [citizen_id])
        return _serialize_citizen(row, grouped_stamps.get(citizen_id, []))


def create_citizen(payload: dict[str, Any], current_user_id: int | None = None) -> dict[str, Any]:
    normalized = _normalize_citizen_payload(payload, current_user_id)
    stamp_rows = _build_stamp_rows(normalized)

    with get_connection() as connection:
        _ensure_user_exists(connection, current_user_id)
        _check_passport_conflict(
            connection,
            normalized["passport_series"],
            normalized["passport_number"],
        )

        cursor = connection.execute(
            """
            INSERT INTO citizens (
                last_name,
                first_name,
                middle_name,
                birth_date,
                birth_place,
                gender,
                passport_series,
                passport_number,
                issue_date,
                issued_by,
                department_code,
                passport_note,
                registration_address,
                phone,
                notes,
                photo_path,
                created_by_user_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                normalized["last_name"],
                normalized["first_name"],
                normalized["middle_name"] or None,
                normalized["birth_date"],
                normalized["birth_place"],
                normalized["gender"],
                normalized["passport_series"],
                normalized["passport_number"],
                normalized["passport_issued_date"],
                normalized["passport_issued_by"],
                normalized["department_code"],
                normalized["passport_note"] or None,
                normalized["registration_address"],
                normalized["phone"] or None,
                normalized["passport_note"] or None,
                normalized["photo_url"] or None,
                normalized["created_by_user_id"],
            ),
        )
        citizen_id = int(cursor.lastrowid)
        _insert_stamp_rows(connection, citizen_id, stamp_rows)
        connection.commit()
        row = _ensure_citizen_exists(connection, citizen_id)
        grouped_stamps = _fetch_stamp_rows_for_citizens(connection, [citizen_id])
        return _serialize_citizen(row, grouped_stamps.get(citizen_id, []))


def update_citizen(citizen_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    normalized = _normalize_citizen_payload(payload, None)
    stamp_rows = _build_stamp_rows(normalized)

    with get_connection() as connection:
        existing_row = _ensure_citizen_exists(connection, citizen_id)
        _check_passport_conflict(
            connection,
            normalized["passport_series"],
            normalized["passport_number"],
            excluded_citizen_id=citizen_id,
        )

        connection.execute(
            """
            UPDATE citizens
            SET
                last_name = ?,
                first_name = ?,
                middle_name = ?,
                birth_date = ?,
                birth_place = ?,
                gender = ?,
                passport_series = ?,
                passport_number = ?,
                issue_date = ?,
                issued_by = ?,
                department_code = ?,
                passport_note = ?,
                registration_address = ?,
                phone = ?,
                notes = ?,
                photo_path = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                normalized["last_name"],
                normalized["first_name"],
                normalized["middle_name"] or None,
                normalized["birth_date"],
                normalized["birth_place"],
                normalized["gender"],
                normalized["passport_series"],
                normalized["passport_number"],
                normalized["passport_issued_date"],
                normalized["passport_issued_by"],
                normalized["department_code"],
                normalized["passport_note"] or None,
                normalized["registration_address"],
                normalized["phone"] or None,
                normalized["passport_note"] or None,
                normalized["photo_url"] or None,
                citizen_id,
            ),
        )
        connection.execute("DELETE FROM stamps WHERE citizen_id = ?", (citizen_id,))
        _insert_stamp_rows(connection, citizen_id, stamp_rows)
        connection.commit()

        row = _ensure_citizen_exists(connection, citizen_id)
        grouped_stamps = _fetch_stamp_rows_for_citizens(connection, [citizen_id])
        return _serialize_citizen(row, grouped_stamps.get(citizen_id, []))


def delete_citizen(citizen_id: int) -> None:
    with get_connection() as connection:
        _ensure_citizen_exists(connection, citizen_id)
        connection.execute("DELETE FROM citizens WHERE id = ?", (citizen_id,))
        connection.commit()
