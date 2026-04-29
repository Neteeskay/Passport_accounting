from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.dependencies.auth import require_roles
from app.schemas.citizens import StampCreate, StampResponse
from app.services.stamps import (
    CitizenNotFoundError,
    StampNotFoundError,
    create_stamp,
    delete_stamp,
    get_stamp,
    list_stamps,
    update_stamp,
)

router = APIRouter(tags=["stamps"], dependencies=[Depends(require_roles("admin", "operator"))])


@router.get("", response_model=list[StampResponse])
def list_citizen_stamps(citizen_id: int) -> list[StampResponse]:
    try:
        stamps = list_stamps(citizen_id)
    except CitizenNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return [StampResponse(**stamp) for stamp in stamps]


@router.get("/{stamp_id}", response_model=StampResponse)
def get_citizen_stamp(citizen_id: int, stamp_id: int) -> StampResponse:
    try:
        stamp = get_stamp(citizen_id, stamp_id)
    except (CitizenNotFoundError, StampNotFoundError) as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return StampResponse(**stamp)


@router.post("", response_model=StampResponse, status_code=status.HTTP_201_CREATED)
def create_citizen_stamp(citizen_id: int, payload: StampCreate) -> StampResponse:
    try:
        stamp = create_stamp(citizen_id, payload.model_dump())
    except CitizenNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return StampResponse(**stamp)


@router.put("/{stamp_id}", response_model=StampResponse)
def update_citizen_stamp(citizen_id: int, stamp_id: int, payload: StampCreate) -> StampResponse:
    try:
        stamp = update_stamp(citizen_id, stamp_id, payload.model_dump())
    except (CitizenNotFoundError, StampNotFoundError) as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return StampResponse(**stamp)


@router.delete("/{stamp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_citizen_stamp(citizen_id: int, stamp_id: int) -> Response:
    try:
        delete_stamp(citizen_id, stamp_id)
    except (CitizenNotFoundError, StampNotFoundError) as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

    return Response(status_code=status.HTTP_204_NO_CONTENT)
