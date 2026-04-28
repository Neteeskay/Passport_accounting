from fastapi import APIRouter, HTTPException, status

from app.schemas.citizens import CitizenCreateRequest, CitizenResponse, CitizenUpdateRequest
from app.services.citizens import (
    CitizenConflictError,
    CitizenNotFoundError,
    RelatedUserNotFoundError,
    create_citizen,
    update_citizen,
)

router = APIRouter(tags=["citizens"])


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
