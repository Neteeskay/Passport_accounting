from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies.auth import require_roles
from app.schemas.citizens import (
    CitizenCreateRequest,
    CitizenListResponse,
    CitizenResponse,
    CitizenUpdateRequest,
)
from app.services.citizens import (
    CitizenConflictError,
    CitizenNotFoundError,
    RelatedUserNotFoundError,
    create_citizen,
    list_citizens,
    update_citizen,
)

router = APIRouter(tags=["citizens"], dependencies=[Depends(require_roles("admin", "operator"))])


@router.get("", response_model=CitizenListResponse)
def list_citizens_endpoint(
    search: str | None = Query(default=None, max_length=200),
    birth_date: date | None = None,
    registration_address: str | None = Query(default=None, max_length=500),
    passport_series: str | None = Query(default=None, max_length=20),
    passport_number: str | None = Query(default=None, max_length=20),
    sort_by: str = Query(default="full_name"),
    sort_order: str = Query(default="asc"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> CitizenListResponse:
    result = list_citizens(
        {
            "search": search,
            "birth_date": birth_date,
            "registration_address": registration_address,
            "passport_series": passport_series,
            "passport_number": passport_number,
            "sort_by": sort_by,
            "sort_order": sort_order,
            "limit": limit,
            "offset": offset,
        }
    )
    return CitizenListResponse(**result)


@router.post("", response_model=CitizenResponse, status_code=status.HTTP_201_CREATED)
def create_citizen_endpoint(payload: CitizenCreateRequest) -> CitizenResponse:
    try:
        citizen = create_citizen(payload.model_dump())
    except CitizenConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    except RelatedUserNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return CitizenResponse(**citizen)


@router.put("/{citizen_id}", response_model=CitizenResponse)
def update_citizen_endpoint(citizen_id: int, payload: CitizenUpdateRequest) -> CitizenResponse:
    try:
        citizen = update_citizen(citizen_id, payload.model_dump())
    except CitizenConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    except RelatedUserNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except CitizenNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return CitizenResponse(**citizen)
