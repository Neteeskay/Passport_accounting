import io
import os
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

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


def _resolve_photo_path(photo_path: str | None) -> Path | None:
    if not photo_path:
        return None

    settings = get_settings()
    raw_path = Path(photo_path)
    candidates = []

    if raw_path.is_absolute():
        candidates.append(raw_path)
    else:
        candidates.extend(
            [
                BASE_DIR / raw_path,
                settings.uploads_dir / raw_path,
                settings.uploads_dir / raw_path.name,
                settings.uploads_dir.parent / raw_path,
            ]
        )

    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return candidate

    return None


def _draw_photo(pdf: canvas.Canvas, citizen: dict, font_name: str) -> None:
    photo_path = _resolve_photo_path(citizen.get("photo_path"))
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
        # Photo is optional and should not block PDF export.
        pdf.setFont(font_name, 9)
        pdf.drawString(PAGE_WIDTH - PAGE_MARGIN - 120, PAGE_HEIGHT - PAGE_MARGIN - 20, "Photo unavailable")


def _format_value(value: str | None) -> str:
    return value if value not in {None, ""} else "—"


def build_citizen_pdf(citizen: dict) -> bytes:
    font_name = _get_font_name()
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle(f"Citizen Card {citizen['id']}")
    pdf.setAuthor("Passport Accounting API")

    y = PAGE_HEIGHT - PAGE_MARGIN
    pdf.setFont(font_name, FONT_SIZE_TITLE)
    pdf.drawString(PAGE_MARGIN, y, "Citizen Passport Card")
    y -= 28

    _draw_photo(pdf, citizen, font_name)

    fields = [
        ("Full name", citizen["full_name"]),
        ("Birth date", citizen["birth_date"]),
        ("Passport", f"{citizen['passport_series']} {citizen['passport_number']}"),
        ("Issue date", _format_value(citizen.get("issue_date"))),
        ("Issued by", _format_value(citizen.get("issued_by"))),
        ("Registration address", citizen["registration_address"]),
        ("Photo path", _format_value(citizen.get("photo_path"))),
        ("Notes", _format_value(citizen.get("notes"))),
        ("Created by user id", _format_value(str(citizen["created_by_user_id"]) if citizen.get("created_by_user_id") else None)),
        ("Created at", citizen["created_at"]),
        ("Updated at", citizen["updated_at"]),
    ]

    text_width = PAGE_WIDTH - (PAGE_MARGIN * 2) - 130
    text_width = max(text_width, 260)

    for label, value in fields:
        y = _draw_wrapped_text(pdf, f"{label}: {value}", PAGE_MARGIN, y, text_width, font_name)
        y -= 2

    y -= 8
    pdf.setFont(font_name, 13)
    y = _ensure_page_space(pdf, y, PAGE_MARGIN + 40, font_name)
    pdf.drawString(PAGE_MARGIN, y, "Stamp history")
    y -= 20

    stamps = citizen.get("stamps", [])
    if not stamps:
        y = _draw_wrapped_text(pdf, "No stamps found.", PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN * 2, font_name)
    else:
        for index, stamp in enumerate(stamps, start=1):
            stamp_lines = [
                f"{index}. Type: {stamp['stamp_type']}",
                f"   Date: {stamp['stamp_placed_at']}",
                f"   Authority: {stamp['stamp_authority']}",
                f"   Note: {_format_value(stamp.get('stamp_note'))}",
            ]

            for line in stamp_lines:
                y = _draw_wrapped_text(
                    pdf,
                    line,
                    PAGE_MARGIN,
                    y,
                    PAGE_WIDTH - PAGE_MARGIN * 2,
                    font_name,
                )
            y -= 4

    pdf.save()
    return buffer.getvalue()


def build_citizen_pdf_filename(citizen: dict) -> str:
    return f"citizen_{citizen['id']}_{citizen['passport_series']}_{citizen['passport_number']}.pdf"
