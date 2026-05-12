import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, Response, UploadFile, status

from app.api.dependencies.auth import require_roles
from app.core.config import get_settings
from app.schemas.citizens import (
    CitizenCreateRequest,
    CitizenResponse,
    CitizenStatsResponse,
    CitizenUpdateRequest,
    PhotoUploadResponse,
)
from app.services.citizens import (
    CitizenConflictError,
    CitizenNotFoundError,
    CitizenValidationError,
    RelatedUserNotFoundError,
    create_citizen,
    delete_citizen,
    get_citizen,
    get_citizen_stats,
    list_citizens,
    update_citizen,
)
from app.services.pdf_export import (
    build_citizen_pdf,
    build_citizen_pdf_filename,
    build_registry_pdf,
    build_registry_pdf_filename,
)

router = APIRouter(tags=["citizens"], dependencies=[Depends(require_roles("admin", "operator"))])


def _build_citizen_filters(
    query: str | None,
    gender: str,
    birth_date_from: str | None,
    birth_date_to: str | None,
    passport: str | None,
    address: str | None,
) -> dict[str, str | None]:
    return {
        "query": query,
        "gender": gender,
        "birth_date_from": birth_date_from,
        "birth_date_to": birth_date_to,
        "passport": passport,
        "address": address,
    }


@router.get("/stats", response_model=CitizenStatsResponse)
def read_citizen_stats(
    query: str | None = Query(default=None, max_length=200),
    gender: str = Query(default="all"),
    birth_date_from: str | None = Query(default=None, alias="birthDateFrom"),
    birth_date_to: str | None = Query(default=None, alias="birthDateTo"),
    passport: str | None = Query(default=None, max_length=50),
    address: str | None = Query(default=None, max_length=500),
) -> CitizenStatsResponse:
    try:
        payload = get_citizen_stats(
            _build_citizen_filters(
                query,
                gender,
                birth_date_from,
                birth_date_to,
                passport,
                address,
            )
        )
    except CitizenValidationError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    return CitizenStatsResponse(**payload)


@router.get("/registry/pdf")
def export_registry_pdf(
    query: str | None = Query(default=None, max_length=200),
    gender: str = Query(default="all"),
    birth_date_from: str | None = Query(default=None, alias="birthDateFrom"),
    birth_date_to: str | None = Query(default=None, alias="birthDateTo"),
    passport: str | None = Query(default=None, max_length=50),
    address: str | None = Query(default=None, max_length=500),
) -> Response:
    try:
        citizens = list_citizens(
            _build_citizen_filters(
                query,
                gender,
                birth_date_from,
                birth_date_to,
                passport,
                address,
            )
        )
    except CitizenValidationError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    pdf_bytes = build_registry_pdf(citizens)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{build_registry_pdf_filename()}"'},
    )


@router.post("/photo", response_model=PhotoUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_citizen_photo(request: Request, file: UploadFile = File(...)) -> PhotoUploadResponse:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Photo file name is required.",
        )

    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only image uploads are supported.",
        )

    settings = get_settings()
    extension = Path(file.filename).suffix.lower() or ".jpg"
    file_name = f"{uuid4().hex}{extension}"
    destination = settings.uploads_dir / file_name

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_url = str(request.base_url).rstrip("/") + f"/uploads/{file_name}"
    return PhotoUploadResponse(
        photo_url=photo_url,
        file_name=file_name,
    )


@router.get("", response_model=list[CitizenResponse])
def list_citizens_endpoint(
    query: str | None = Query(default=None, max_length=200),
    gender: str = Query(default="all"),
    birth_date_from: str | None = Query(default=None, alias="birthDateFrom"),
    birth_date_to: str | None = Query(default=None, alias="birthDateTo"),
    passport: str | None = Query(default=None, max_length=50),
    address: str | None = Query(default=None, max_length=500),
) -> list[CitizenResponse]:
    try:
        citizens = list_citizens(
            _build_citizen_filters(
                query,
                gender,
                birth_date_from,
                birth_date_to,
                passport,
                address,
            )
        )
    except CitizenValidationError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    return [CitizenResponse(**citizen) for citizen in citizens]


@router.get("/{citizen_id}", response_model=CitizenResponse)
def get_citizen_endpoint(citizen_id: int) -> CitizenResponse:
    try:
        citizen = get_citizen(citizen_id)
    except CitizenNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return CitizenResponse(**citizen)


@router.get("/{citizen_id}/pdf")
def export_citizen_pdf(citizen_id: int) -> Response:
    try:
        citizen = get_citizen(citizen_id)
    except CitizenNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    pdf_bytes = build_citizen_pdf(citizen)
    filename = build_citizen_pdf_filename(citizen)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("", response_model=CitizenResponse, status_code=status.HTTP_201_CREATED)
def create_citizen_endpoint(
    payload: CitizenCreateRequest,
    current_user: dict = Depends(require_roles("admin", "operator")),
) -> CitizenResponse:
    try:
        citizen = create_citizen(payload.model_dump(), current_user_id=int(current_user["id"]))
    except CitizenConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    except RelatedUserNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except CitizenValidationError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    return CitizenResponse(**citizen)


@router.put("/{citizen_id}", response_model=CitizenResponse)
def update_citizen_endpoint(
    citizen_id: int,
    payload: CitizenUpdateRequest,
) -> CitizenResponse:
    try:
        citizen = update_citizen(citizen_id, payload.model_dump())
    except CitizenConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    except RelatedUserNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except CitizenNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except CitizenValidationError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    return CitizenResponse(**citizen)


@router.delete("/{citizen_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_citizen_endpoint(citizen_id: int) -> Response:
    try:
        delete_citizen(citizen_id)
    except CitizenNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return Response(status_code=status.HTTP_204_NO_CONTENT)
