import type {
  ChildRecord,
  Citizen,
  ForeignPassportRecord,
  HistoryRecord,
  MarriageRecord,
  MilitaryRecord,
  NameChangeRecord,
  RegistrationStamp,
  Stamp
} from "@/types/citizen";

export type StampCategory =
  | "history"
  | "registration"
  | "children"
  | "marriage"
  | "military"
  | "foreign_passport"
  | "name_change";

export type ApiCitizenStamp = {
  id: string;
  stampCategory: StampCategory;
  stampType: string;
  stampPlacedAt: string;
  stampAuthority: string;
  stampNote: string;
  isActive: boolean;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CitizenStampPayload = Omit<ApiCitizenStamp, "createdAt" | "id" | "updatedAt">;

export function mergeCitizenStamps(citizen: Citizen, apiStamps: ApiCitizenStamp[]): Citizen {
  return {
    ...citizen,
    stamps: apiStamps.map(apiStampToPreviewStamp),
    registrationStamps: mapCategory(apiStamps, "registration", apiStampToRegistrationStamp),
    children: mapCategory(apiStamps, "children", apiStampToChildRecord),
    marriageRecords: mapCategory(apiStamps, "marriage", apiStampToMarriageRecord),
    militaryRecords: mapCategory(apiStamps, "military", apiStampToMilitaryRecord),
    foreignPassports: mapCategory(apiStamps, "foreign_passport", apiStampToForeignPassportRecord),
    nameChanges: mapCategory(apiStamps, "name_change", apiStampToNameChangeRecord),
    historyRecords: mapCategory(apiStamps, "history", apiStampToHistoryRecord)
  };
}

function mapCategory<T>(
  stamps: ApiCitizenStamp[],
  category: StampCategory,
  mapper: (stamp: ApiCitizenStamp) => T
) {
  return stamps.filter((stamp) => stamp.stampCategory === category).map(mapper);
}

function apiStampToPreviewStamp(stamp: ApiCitizenStamp): Stamp {
  return {
    id: stamp.id,
    type: toPreviewType(stamp.stampCategory),
    date: stamp.stampPlacedAt,
    authority: stamp.stampAuthority,
    comment: stamp.stampNote || stamp.stampType
  };
}

function apiStampToRegistrationStamp(stamp: ApiCitizenStamp): RegistrationStamp {
  const details = stamp.details;

  return {
    id: stamp.id,
    type: stamp.stampType === "deregistration" ? "deregistration" : "registration",
    date: stamp.stampPlacedAt,
    region: stringDetail(details, "region"),
    district: stringDetail(details, "district"),
    locality: stringDetail(details, "locality"),
    settlement: stringDetail(details, "settlement"),
    street: stringDetail(details, "street"),
    house: stringDetail(details, "house"),
    apartment: stringDetail(details, "apartment"),
    authority: stamp.stampAuthority,
    departmentCode: stringDetail(details, "departmentCode"),
    certifier: stringDetail(details, "certifier")
  };
}

function apiStampToChildRecord(stamp: ApiCitizenStamp): ChildRecord {
  const details = stamp.details;

  return {
    id: stamp.id,
    lastName: stringDetail(details, "lastName"),
    firstName: stringDetail(details, "firstName"),
    middleName: stringDetail(details, "middleName"),
    gender: stringDetail(details, "gender") === "female" ? "female" : "male",
    birthDate: stamp.stampPlacedAt || stringDetail(details, "birthDate"),
    personalMark: stringDetail(details, "personalMark") || stamp.stampNote
  };
}

function apiStampToMarriageRecord(stamp: ApiCitizenStamp): MarriageRecord {
  const details = stamp.details;

  return {
    id: stamp.id,
    status: stamp.stampType === "dissolved" ? "dissolved" : "registered",
    date: stamp.stampPlacedAt,
    spouseLastName: stringDetail(details, "spouseLastName"),
    spouseFirstName: stringDetail(details, "spouseFirstName"),
    spouseMiddleName: stringDetail(details, "spouseMiddleName"),
    spouseBirthDate: stringDetail(details, "spouseBirthDate"),
    authority: stamp.stampAuthority,
    actRecordNumber: stringDetail(details, "actRecordNumber"),
    certifier: stringDetail(details, "certifier")
  };
}

function apiStampToMilitaryRecord(stamp: ApiCitizenStamp): MilitaryRecord {
  const details = stamp.details;

  return {
    id: stamp.id,
    status: stamp.stampType === "exempt" ? "exempt" : "liable",
    authority: stamp.stampAuthority,
    signedBy: stringDetail(details, "signedBy") || stamp.stampNote,
    date: stamp.stampPlacedAt
  };
}

function apiStampToForeignPassportRecord(stamp: ApiCitizenStamp): ForeignPassportRecord {
  const details = stamp.details;

  return {
    id: stamp.id,
    issueDate: stamp.stampPlacedAt,
    series: stringDetail(details, "series"),
    number: stringDetail(details, "number"),
    authority: stamp.stampAuthority,
    note: stamp.stampNote
  };
}

function apiStampToNameChangeRecord(stamp: ApiCitizenStamp): NameChangeRecord {
  const details = stamp.details;

  return {
    id: stamp.id,
    reason: stringDetail(details, "reason") || stamp.stampType,
    documentNumber: stringDetail(details, "documentNumber"),
    previousLastName: stringDetail(details, "previousLastName"),
    previousFirstName: stringDetail(details, "previousFirstName"),
    previousMiddleName: stringDetail(details, "previousMiddleName"),
    newLastName: stringDetail(details, "newLastName"),
    newFirstName: stringDetail(details, "newFirstName"),
    newMiddleName: stringDetail(details, "newMiddleName"),
    date: stamp.stampPlacedAt,
    authority: stamp.stampAuthority,
    note: stamp.stampNote
  };
}

function apiStampToHistoryRecord(stamp: ApiCitizenStamp): HistoryRecord {
  const details = stamp.details;

  return {
    id: stamp.id,
    event: stamp.stampType,
    isCurrent: stamp.isActive,
    series: stringDetail(details, "series"),
    number: stringDetail(details, "number"),
    departmentCode: stringDetail(details, "departmentCode"),
    issueDate: stamp.stampPlacedAt,
    authority: stamp.stampAuthority,
    note: stamp.stampNote
  };
}

function stringDetail(details: Record<string, unknown>, key: string) {
  const value = details[key];

  return typeof value === "string" ? value : "";
}

function toPreviewType(category: StampCategory): Stamp["type"] {
  if (category === "registration") {
    return "registration";
  }

  if (category === "military") {
    return "military_duty";
  }

  if (category === "foreign_passport") {
    return "foreign_passport";
  }

  if (category === "name_change") {
    return "name_change";
  }

  return "marital_status";
}
