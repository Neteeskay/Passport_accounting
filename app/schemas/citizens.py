from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.core.api_utils import to_camel

StampCategory = Literal[
    "history",
    "registration",
    "children",
    "marriage",
    "military",
    "foreign_passport",
    "name_change",
]

PreviewStampType = Literal[
    "registration",
    "deregistration",
    "marital_status",
    "military_duty",
    "foreign_passport",
    "name_change",
]

Gender = Literal["male", "female"]


class CitizenApiModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
    )


class StampCreate(CitizenApiModel):
    stamp_category: StampCategory = "history"
    stamp_type: str = Field(min_length=1, max_length=100)
    stamp_placed_at: str
    stamp_authority: str | None = Field(default=None, max_length=255)
    stamp_note: str | None = Field(default=None, max_length=1000)
    is_active: bool = False
    details: dict[str, Any] = Field(default_factory=dict)


class PreviewStampResponse(CitizenApiModel):
    id: str
    type: PreviewStampType
    date: str
    authority: str
    comment: str | None = None


class RegistrationStampPayload(CitizenApiModel):
    id: str | None = None
    type: Literal["registration", "deregistration"]
    date: str
    region: str
    district: str = ""
    locality: str
    settlement: str = ""
    street: str
    house: str
    apartment: str = ""
    authority: str
    department_code: str
    certifier: str


class ChildRecordPayload(CitizenApiModel):
    id: str | None = None
    last_name: str
    first_name: str
    middle_name: str = ""
    gender: Gender
    birth_date: str
    personal_mark: str = ""


class MarriageRecordPayload(CitizenApiModel):
    id: str | None = None
    status: Literal["registered", "dissolved"]
    date: str
    spouse_last_name: str
    spouse_first_name: str
    spouse_middle_name: str = ""
    spouse_birth_date: str = ""
    authority: str
    act_record_number: str = ""
    certifier: str = ""


class MilitaryRecordPayload(CitizenApiModel):
    id: str | None = None
    status: Literal["liable", "exempt"]
    authority: str
    signed_by: str
    date: str


class ForeignPassportRecordPayload(CitizenApiModel):
    id: str | None = None
    issue_date: str
    series: str
    number: str
    authority: str
    note: str = ""


class NameChangeRecordPayload(CitizenApiModel):
    id: str | None = None
    reason: str
    document_number: str
    previous_last_name: str
    previous_first_name: str
    previous_middle_name: str = ""
    new_last_name: str
    new_first_name: str
    new_middle_name: str = ""
    date: str
    authority: str
    note: str = ""


class HistoryRecordPayload(CitizenApiModel):
    id: str | None = None
    event: str
    is_current: bool = False
    series: str
    number: str
    department_code: str
    issue_date: str
    authority: str
    note: str = ""


class CitizenCreateRequest(CitizenApiModel):
    last_name: str = Field(min_length=1, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    middle_name: str = Field(default="", max_length=100)
    birth_date: str
    birth_place: str = Field(min_length=1, max_length=255)
    gender: Gender
    passport_series: str = Field(min_length=1, max_length=20)
    passport_number: str = Field(min_length=1, max_length=20)
    passport_issued_by: str = Field(min_length=1, max_length=255)
    passport_issued_date: str
    department_code: str = Field(min_length=1, max_length=20)
    passport_note: str = Field(default="", max_length=2000)
    phone: str = Field(default="", max_length=50)
    photo_url: str = Field(default="", max_length=500)
    registration_stamps: list[RegistrationStampPayload] = Field(default_factory=list)
    children: list[ChildRecordPayload] = Field(default_factory=list)
    marriage_records: list[MarriageRecordPayload] = Field(default_factory=list)
    military_records: list[MilitaryRecordPayload] = Field(default_factory=list)
    foreign_passports: list[ForeignPassportRecordPayload] = Field(default_factory=list)
    name_changes: list[NameChangeRecordPayload] = Field(default_factory=list)
    history_records: list[HistoryRecordPayload] = Field(default_factory=list)


class CitizenUpdateRequest(CitizenCreateRequest):
    pass


class CitizenFilterQuery(CitizenApiModel):
    search: str | None = Field(default=None, max_length=200)
    gender: Literal["all", "male", "female"] = "all"
    birth_date_from: str | None = None
    birth_date_to: str | None = None
    passport: str | None = Field(default=None, max_length=50)
    registration_address: str | None = Field(default=None, max_length=500)


class RegistrationStampResponse(RegistrationStampPayload):
    id: str


class ChildRecordResponse(ChildRecordPayload):
    id: str


class MarriageRecordResponse(MarriageRecordPayload):
    id: str


class MilitaryRecordResponse(MilitaryRecordPayload):
    id: str


class ForeignPassportRecordResponse(ForeignPassportRecordPayload):
    id: str


class NameChangeRecordResponse(NameChangeRecordPayload):
    id: str


class HistoryRecordResponse(HistoryRecordPayload):
    id: str


class StampResponse(CitizenApiModel):
    id: str
    stamp_category: StampCategory
    stamp_type: str
    stamp_placed_at: str
    stamp_authority: str
    stamp_note: str | None = None
    is_active: bool = False
    details: dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class CitizenResponse(CitizenApiModel):
    id: str
    last_name: str
    first_name: str
    middle_name: str = ""
    birth_date: str
    birth_place: str
    gender: Gender
    passport_series: str
    passport_number: str
    passport_issued_by: str
    passport_issued_date: str
    department_code: str
    passport_note: str = ""
    registration_address: str
    phone: str = ""
    photo_url: str = ""
    stamps: list[PreviewStampResponse] = Field(default_factory=list)
    registration_stamps: list[RegistrationStampResponse] = Field(default_factory=list)
    children: list[ChildRecordResponse] = Field(default_factory=list)
    marriage_records: list[MarriageRecordResponse] = Field(default_factory=list)
    military_records: list[MilitaryRecordResponse] = Field(default_factory=list)
    foreign_passports: list[ForeignPassportRecordResponse] = Field(default_factory=list)
    name_changes: list[NameChangeRecordResponse] = Field(default_factory=list)
    history_records: list[HistoryRecordResponse] = Field(default_factory=list)
    created_at: str
    updated_at: str


class CitizenStatsResponse(CitizenApiModel):
    total: int
    male: int
    female: int


class PhotoUploadResponse(CitizenApiModel):
    photo_url: str
    file_name: str
