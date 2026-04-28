from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class StampCreate(BaseModel):
    stamp_type: str = Field(min_length=1, max_length=100)
    stamp_placed_at: date
    stamp_authority: str = Field(min_length=1, max_length=255)
    stamp_note: str | None = Field(default=None, max_length=1000)


class CitizenCreateRequest(BaseModel):
    last_name: str = Field(min_length=1, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    birth_date: date
    passport_series: str = Field(min_length=1, max_length=20)
    passport_number: str = Field(min_length=1, max_length=20)
    issue_date: date | None = None
    issued_by: str | None = Field(default=None, max_length=255)
    registration_address: str = Field(min_length=1, max_length=500)
    notes: str | None = Field(default=None, max_length=2000)
    photo_path: str | None = Field(default=None, max_length=500)
    created_by_user_id: int | None = Field(default=None, ge=1)
    stamps: list[StampCreate] = Field(default_factory=list)


class CitizenUpdateRequest(CitizenCreateRequest):
    pass


class StampResponse(BaseModel):
    id: int
    stamp_type: str
    stamp_placed_at: date
    stamp_authority: str
    stamp_note: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CitizenResponse(BaseModel):
    id: int
    last_name: str
    first_name: str
    middle_name: str | None = None
    full_name: str
    birth_date: date
    passport_series: str
    passport_number: str
    issue_date: date | None = None
    issued_by: str | None = None
    registration_address: str
    notes: str | None = None
    photo_path: str | None = None
    created_by_user_id: int | None = None
    created_at: datetime
    updated_at: datetime
    stamps: list[StampResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
