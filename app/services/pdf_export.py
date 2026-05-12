import io
import os
from datetime import datetime
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from app.core.api_utils import format_date_output
from app.core.config import BASE_DIR, get_settings

PAGE_WIDTH, PAGE_HEIGHT = A4
PAGE_MARGIN = 48
FONT_SIZE_BODY = 11
FONT_SIZE_TITLE = 18
LINE_HEIGHT = 16


def _get_font_name() -> str:
    preferred_name = "PassportAccountingFont"
    if preferred_name in pdfmetrics.getRegisteredFontNames():
        return preferred_name

    font_candidates = [
        Path(os.environ.get("WINDIR", "C:\\Windows")) / "Fonts" / "arial.ttf",
        Path(os.environ.get("WINDIR", "C:\\Windows")) / "Fonts" / "calibri.ttf",
        Path(os.environ.get("WINDIR", "C:\\Windows")) / "Fonts" / "tahoma.ttf",
    ]

    for candidate in font_candidates:
        if candidate.exists():
            pdfmetrics.registerFont(TTFont(preferred_name, str(candidate)))
            return preferred_name

    return "Helvetica"


def _wrap_text(text: str, font_name: str, font_size: int, max_width: float) -> list[str]:
    words = text.split()
    if not words:
        return [""]

    lines: list[str] = []
    current = words[0]

    for word in words[1:]:
        candidate = f"{current} {word}"
        if pdfmetrics.stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word

    lines.append(current)
    return lines


def _ensure_page_space(pdf: canvas.Canvas, y: float, required_height: float, font_name: str) -> float:
    if y >= required_height:
        return y

    pdf.showPage()
    pdf.setFont(font_name, FONT_SIZE_BODY)
    return PAGE_HEIGHT - PAGE_MARGIN


def _draw_wrapped_text(
    pdf: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font_name: str,
    font_size: int = FONT_SIZE_BODY,
) -> float:
    pdf.setFont(font_name, font_size)
    for line in _wrap_text(text, font_name, font_size, width):
        y = _ensure_page_space(pdf, y, PAGE_MARGIN + LINE_HEIGHT, font_name)
        pdf.drawString(x, y, line)
        y -= LINE_HEIGHT
    return y


def _resolve_photo_path(photo_url: str | None) -> Path | None:
    if not photo_url:
        return None

    settings = get_settings()
    normalized = str(photo_url).strip()
    if not normalized:
        return None

    raw_path = Path(normalized)
    candidates: list[Path] = []

    if "/uploads/" in normalized:
        candidates.append(settings.uploads_dir / normalized.split("/uploads/", 1)[1])
    elif normalized.startswith("/uploads/"):
        candidates.append(settings.uploads_dir / normalized.removeprefix("/uploads/"))
    elif raw_path.is_absolute():
        candidates.append(raw_path)
    else:
        candidates.extend(
            [
                BASE_DIR / raw_path,
                settings.uploads_dir / raw_path,
                settings.uploads_dir / raw_path.name,
            ]
        )

    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return candidate

    return None


def _draw_photo(pdf: canvas.Canvas, citizen: dict, font_name: str) -> None:
    photo_path = _resolve_photo_path(citizen.get("photo_url"))
    if photo_path is None:
        return

    try:
        image = ImageReader(str(photo_path))
        pdf.drawImage(
            image,
            PAGE_WIDTH - PAGE_MARGIN - 120,
            PAGE_HEIGHT - PAGE_MARGIN - 160,
            width=100,
            height=130,
            preserveAspectRatio=True,
            mask="auto",
        )
    except Exception:
        pdf.setFont(font_name, 9)
        pdf.drawString(PAGE_WIDTH - PAGE_MARGIN - 120, PAGE_HEIGHT - PAGE_MARGIN - 20, "Photo unavailable")


def _format_value(value: str | None) -> str:
    return value if value not in {None, ""} else "—"


def _full_name(citizen: dict) -> str:
    return " ".join(
        part
        for part in [
            citizen.get("last_name", ""),
            citizen.get("first_name", ""),
            citizen.get("middle_name", ""),
        ]
        if part
    )


def build_citizen_pdf(citizen: dict) -> bytes:
    font_name = _get_font_name()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle(f"Citizen Card {citizen['id']}")
    pdf.setAuthor("Passport Accounting API")

    y = PAGE_HEIGHT - PAGE_MARGIN
    pdf.setFont(font_name, FONT_SIZE_TITLE)
    pdf.drawString(PAGE_MARGIN, y, "Карточка гражданина")
    y -= 28

    _draw_photo(pdf, citizen, font_name)

    fields = [
        ("ФИО", _full_name(citizen)),
        ("Дата рождения", format_date_output(citizen.get("birth_date"))),
        ("Место рождения", _format_value(citizen.get("birth_place"))),
        ("Пол", "Мужской" if citizen.get("gender") == "male" else "Женский"),
        ("Паспорт", f"{citizen['passport_series']} {citizen['passport_number']}"),
        ("Дата выдачи", format_date_output(citizen.get("passport_issued_date"))),
        ("Кем выдан", _format_value(citizen.get("passport_issued_by"))),
        ("Код подразделения", _format_value(citizen.get("department_code"))),
        ("Адрес регистрации", _format_value(citizen.get("registration_address"))),
        ("Телефон", _format_value(citizen.get("phone"))),
        ("Примечание", _format_value(citizen.get("passport_note"))),
        ("Создано", _format_value(citizen.get("created_at"))),
        ("Обновлено", _format_value(citizen.get("updated_at"))),
    ]

    text_width = PAGE_WIDTH - (PAGE_MARGIN * 2) - 130
    text_width = max(text_width, 260)

    for label, value in fields:
        y = _draw_wrapped_text(pdf, f"{label}: {value}", PAGE_MARGIN, y, text_width, font_name)
        y -= 2

    sections = [
        ("История паспортов", citizen.get("history_records", []), lambda item: [
            f"{item['event']} — {item['series']} {item['number']}",
            f"Дата выдачи: {item['issue_date']}",
            f"Кем выдан: {item['authority']}",
        ]),
        ("Штампы регистрации", citizen.get("registration_stamps", []), lambda item: [
            f"{'Регистрация' if item['type'] == 'registration' else 'Снятие с учёта'} — {item['date']}",
            f"Адрес: {', '.join(part for part in [item['locality'], item['settlement'], item['street'], item['house'], item['apartment']] if part)}",
            f"Подразделение: {item['authority']} ({item['department_code']})",
        ]),
        ("Дети", citizen.get("children", []), lambda item: [
            f"{item['last_name']} {item['first_name']} {item['middle_name']}".strip(),
            f"Дата рождения: {item['birth_date']}",
            f"Пол: {'М' if item['gender'] == 'male' else 'Ж'}",
        ]),
        ("Брак", citizen.get("marriage_records", []), lambda item: [
            f"{'Зарегистрирован' if item['status'] == 'registered' else 'Расторгнут'} — {item['date']}",
            f"Супруг(а): {' '.join(part for part in [item['spouse_last_name'], item['spouse_first_name'], item['spouse_middle_name']] if part)}",
            f"Орган: {item['authority']}",
        ]),
        ("Воинская обязанность", citizen.get("military_records", []), lambda item: [
            f"{'Обязан(а)' if item['status'] == 'liable' else 'Освобождён(а)'} — {item['date']}",
            f"Орган: {item['authority']}",
            f"Подпись/заверил: {item['signed_by'] or '—'}",
        ]),
        ("Загранпаспорт", citizen.get("foreign_passports", []), lambda item: [
            f"{item['series']} {item['number']} — {item['issue_date']}",
            f"Орган: {item['authority']}",
            f"Примечание: {item['note'] or '—'}",
        ]),
        ("Смена ФИО", citizen.get("name_changes", []), lambda item: [
            f"{item['date']} — {item['reason']}",
            f"Было: {' '.join(part for part in [item['previous_last_name'], item['previous_first_name'], item['previous_middle_name']] if part)}",
            f"Стало: {' '.join(part for part in [item['new_last_name'], item['new_first_name'], item['new_middle_name']] if part)}",
        ]),
    ]

    for section_title, items, line_builder in sections:
        if not items:
            continue
        y -= 10
        y = _ensure_page_space(pdf, y, PAGE_MARGIN + 50, font_name)
        pdf.setFont(font_name, 13)
        pdf.drawString(PAGE_MARGIN, y, section_title)
        y -= 18
        for item in items:
            for line in line_builder(item):
                y = _draw_wrapped_text(pdf, line, PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN * 2, font_name)
            y -= 4

    pdf.save()
    return buffer.getvalue()


def build_registry_pdf(citizens: list[dict]) -> bytes:
    font_name = _get_font_name()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle("Citizens Registry")
    pdf.setAuthor("Passport Accounting API")

    y = PAGE_HEIGHT - PAGE_MARGIN
    pdf.setFont(font_name, FONT_SIZE_TITLE)
    pdf.drawString(PAGE_MARGIN, y, "Реестр граждан")
    y -= 24
    pdf.setFont(font_name, FONT_SIZE_BODY)
    pdf.drawString(PAGE_MARGIN, y, f"Количество записей: {len(citizens)}")
    y -= 24

    for index, citizen in enumerate(citizens, start=1):
        y = _ensure_page_space(pdf, y, PAGE_MARGIN + 80, font_name)
        lines = [
            f"{index}. {_full_name(citizen)}",
            f"   Дата рождения: {format_date_output(citizen.get('birth_date'))}",
            f"   Паспорт: {citizen.get('passport_series', '')} {citizen.get('passport_number', '')}",
            f"   Адрес: {_format_value(citizen.get('registration_address'))}",
            f"   Выдан: {format_date_output(citizen.get('passport_issued_date'))}",
        ]
        for line in lines:
            y = _draw_wrapped_text(pdf, line, PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN * 2, font_name)
        y -= 6

    pdf.save()
    return buffer.getvalue()


def build_citizen_pdf_filename(citizen: dict) -> str:
    return f"citizen_{citizen['id']}_{citizen['passport_series']}_{citizen['passport_number']}.pdf"


def build_registry_pdf_filename() -> str:
    return f"citizens_registry_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
