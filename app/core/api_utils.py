from datetime import datetime


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def parse_date_input(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    if not normalized:
        return None

    for fmt in ("%Y-%m-%d", "%d.%m.%Y"):
        try:
            return datetime.strptime(normalized, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    raise ValueError(f"Unsupported date format: {value}")


def format_date_output(value: str | None) -> str:
    if value is None:
        return ""

    normalized = str(value).strip()
    if not normalized:
        return ""

    for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%d.%m.%Y"):
        try:
            return datetime.strptime(normalized, fmt).strftime("%d.%m.%Y")
        except ValueError:
            continue

    return normalized


def format_timestamp_output(value: str | None) -> str:
    if value is None:
        return ""

    normalized = str(value).strip()
    if not normalized:
        return ""

    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            parsed = datetime.strptime(normalized, fmt)
            if fmt == "%Y-%m-%d":
                return parsed.strftime("%Y-%m-%dT00:00:00")
            return parsed.strftime("%Y-%m-%dT%H:%M:%S")
        except ValueError:
            continue

    return normalized
