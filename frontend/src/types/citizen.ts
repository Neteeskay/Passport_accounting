export type StampType =
  | "registration"
  | "deregistration"
  | "marital_status"
  | "military_duty"
  | "foreign_passport"
  | "name_change";

export type Stamp = {
  id: string;
  type: StampType;
  date: string;
  authority: string;
  comment?: string;
};

export type RegistrationStamp = {
  id: string;
  type: "registration" | "deregistration";
  date: string;
  region: string;
  district: string;
  locality: string;
  settlement: string;
  street: string;
  house: string;
  apartment?: string;
  authority: string;
  departmentCode: string;
  certifier: string;
};

export type ChildRecord = {
  id: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  gender: "male" | "female";
  birthDate: string;
  personalMark?: string;
};

export type MarriageRecord = {
  id: string;
  status: "registered" | "dissolved";
  date: string;
  spouseLastName: string;
  spouseFirstName: string;
  spouseMiddleName?: string;
  spouseBirthDate: string;
  authority: string;
  actRecordNumber: string;
  certifier: string;
};

export type MilitaryRecord = {
  id: string;
  status: "liable" | "exempt";
  authority: string;
  signedBy: string;
  date: string;
};

export type ForeignPassportRecord = {
  id: string;
  issueDate: string;
  series: string;
  number: string;
  authority: string;
  note?: string;
};

export type NameChangeRecord = {
  id: string;
  reason: string;
  documentNumber: string;
  previousLastName: string;
  previousFirstName: string;
  previousMiddleName?: string;
  newLastName: string;
  newFirstName: string;
  newMiddleName?: string;
  date: string;
  authority: string;
  note?: string;
};

export type HistoryRecord = {
  id: string;
  event: string;
  isCurrent: boolean;
  series: string;
  number: string;
  departmentCode: string;
  issueDate: string;
  authority: string;
  note?: string;
};

export type Citizen = {
  id: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate: string;
  birthPlace: string;
  gender: "male" | "female";
  passportSeries: string;
  passportNumber: string;
  passportIssuedBy: string;
  passportIssuedDate: string;
  departmentCode: string;
  passportNote?: string;
  registrationAddress: string;
  phone?: string;
  photoUrl?: string;
  stamps: Stamp[];
  registrationStamps?: RegistrationStamp[];
  children?: ChildRecord[];
  marriageRecords?: MarriageRecord[];
  militaryRecords?: MilitaryRecord[];
  foreignPassports?: ForeignPassportRecord[];
  nameChanges?: NameChangeRecord[];
  historyRecords?: HistoryRecord[];
  createdAt: string;
  updatedAt: string;
};
