import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen, Stamp, StampType } from "@/types/citizen";

export type ApiCitizen = {
  id?: string | number;
  lastName?: string;
  last_name?: string;
  firstName?: string;
  first_name?: string;
  middleName?: string | null;
  middle_name?: string | null;
  fullName?: string;
  full_name?: string;
  birthDate?: string;
  birth_date?: string;
  birthPlace?: string;
  birth_place?: string;
  gender?: "male" | "female" | string;
  passportSeries?: string;
  passport_series?: string;
  passportNumber?: string;
  passport_number?: string;
  passportIssuedBy?: string;
  passport_issued_by?: string;
  passportIssuedDate?: string;
  passport_issued_date?: string;
  departmentCode?: string;
  department_code?: string;
  passportNote?: string | null;
  registrationAddress?: string;
  registration_address?: string;
  phone?: string | null;
  photoUrl?: string | null;
  photo_url?: string | null;
  photo_path?: string | null;
  notes?: string | null;
  passport_note?: string | null;
  stamps?: ApiStamp[];
  registrationStamps?: Citizen["registrationStamps"];
  children?: Citizen["children"];
  marriageRecords?: Citizen["marriageRecords"];
  militaryRecords?: Citizen["militaryRecords"];
  foreignPassports?: Citizen["foreignPassports"];
  nameChanges?: Citizen["nameChanges"];
  historyRecords?: Citizen["historyRecords"];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

export type ApiStamp = {
  id?: string | number;
  type?: StampType | string;
  stamp_type?: StampType | string;
  date?: string;
  stamp_date?: string;
  authority?: string;
  comment?: string | null;
  description?: string | null;
};

export type ApiCitizenPayload = Omit<
  CitizenFormValues,
  | "children"
  | "foreignPassports"
  | "historyRecords"
  | "marriageRecords"
  | "militaryRecords"
  | "nameChanges"
  | "registrationStamps"
>;

export function citizenFormToApiPayload(values: CitizenFormValues): ApiCitizenPayload {
  return {
    lastName: values.lastName,
    firstName: values.firstName,
    middleName: values.middleName,
    birthDate: values.birthDate,
    birthPlace: values.birthPlace,
    gender: values.gender,
    passportSeries: values.passportSeries,
    passportNumber: values.passportNumber,
    passportIssuedBy: values.passportIssuedBy,
    passportIssuedDate: values.passportIssuedDate,
    departmentCode: values.departmentCode,
    passportNote: values.passportNote,
    phone: values.phone,
    photoUrl: values.photoUrl
  };
}

export function apiCitizenToCitizen(apiCitizen: ApiCitizen): Citizen {
  const nameParts = (apiCitizen.fullName ?? apiCitizen.full_name ?? "").split(" ").filter(Boolean);
  const lastName = apiCitizen.lastName ?? apiCitizen.last_name ?? nameParts[0] ?? "";
  const firstName = apiCitizen.firstName ?? apiCitizen.first_name ?? nameParts[1] ?? "";
  const middleName = apiCitizen.middleName ?? apiCitizen.middle_name ?? nameParts.slice(2).join(" ");
  const now = new Date().toISOString();

  return {
    id: String(apiCitizen.id ?? `${lastName}-${firstName}-${apiCitizen.passport_number ?? ""}`),
    lastName,
    firstName,
    middleName,
    birthDate: apiCitizen.birthDate ?? apiCitizen.birth_date ?? "",
    birthPlace: apiCitizen.birthPlace ?? apiCitizen.birth_place ?? "",
    gender: apiCitizen.gender === "female" ? "female" : "male",
    passportSeries: apiCitizen.passportSeries ?? apiCitizen.passport_series ?? "",
    passportNumber: apiCitizen.passportNumber ?? apiCitizen.passport_number ?? "",
    passportIssuedBy: apiCitizen.passportIssuedBy ?? apiCitizen.passport_issued_by ?? "",
    passportIssuedDate: apiCitizen.passportIssuedDate ?? apiCitizen.passport_issued_date ?? "",
    departmentCode: apiCitizen.departmentCode ?? apiCitizen.department_code ?? "",
    passportNote: apiCitizen.passportNote ?? apiCitizen.passport_note ?? apiCitizen.notes ?? "",
    registrationAddress: apiCitizen.registrationAddress ?? apiCitizen.registration_address ?? "",
    phone: apiCitizen.phone ?? "",
    photoUrl: apiCitizen.photoUrl ?? apiCitizen.photo_url ?? apiCitizen.photo_path ?? "",
    stamps: apiStampsToStamps(apiCitizen.stamps ?? []),
    registrationStamps: apiCitizen.registrationStamps,
    children: apiCitizen.children,
    marriageRecords: apiCitizen.marriageRecords,
    militaryRecords: apiCitizen.militaryRecords,
    foreignPassports: apiCitizen.foreignPassports,
    nameChanges: apiCitizen.nameChanges,
    historyRecords: apiCitizen.historyRecords,
    createdAt: apiCitizen.createdAt ?? apiCitizen.created_at ?? now,
    updatedAt: apiCitizen.updatedAt ?? apiCitizen.updated_at ?? apiCitizen.createdAt ?? apiCitizen.created_at ?? now
  };
}

export function apiStampsToStamps(stamps: ApiStamp[]): Stamp[] {
  return stamps.map((stamp, index) => ({
    id: String(stamp.id ?? `stamp-${index}`),
    type: normalizeStampType(stamp.stamp_type ?? stamp.type),
    date: stamp.stamp_date ?? stamp.date ?? "",
    authority: stamp.authority ?? "",
    comment: stamp.comment ?? stamp.description ?? ""
  }));
}

function normalizeStampType(type?: string): StampType {
  if (
    type === "registration" ||
    type === "deregistration" ||
    type === "marital_status" ||
    type === "military_duty" ||
    type === "foreign_passport" ||
    type === "name_change"
  ) {
    return type;
  }

  return "registration";
}
