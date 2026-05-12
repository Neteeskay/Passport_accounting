import { buildCitizenFromForm } from "@/lib/utils/citizen-form";
import type { CitizenFormValues } from "@/lib/validation/citizen";
import type { Citizen, Stamp, StampType } from "@/types/citizen";

export type ApiCitizen = {
  id?: string | number;
  last_name?: string;
  first_name?: string;
  middle_name?: string | null;
  full_name?: string;
  birth_date?: string;
  birth_place?: string;
  gender?: "male" | "female" | string;
  passport_series?: string;
  passport_number?: string;
  passport_issued_by?: string;
  passport_issued_date?: string;
  department_code?: string;
  registration_address?: string;
  phone?: string | null;
  photo_url?: string | null;
  photo_path?: string | null;
  notes?: string | null;
  passport_note?: string | null;
  stamps?: ApiStamp[];
  created_at?: string;
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

export type ApiCitizenPayload = {
  last_name: string;
  first_name: string;
  middle_name: string;
  birth_date: string;
  birth_place: string;
  gender: "male" | "female";
  passport_series: string;
  passport_number: string;
  passport_issued_by: string;
  passport_issued_date: string;
  department_code: string;
  registration_address: string;
  phone: string;
  photo_url: string;
  notes: string;
};

export function citizenFormToApiPayload(values: CitizenFormValues): ApiCitizenPayload {
  const citizen = buildCitizenFromForm(values);

  return {
    last_name: values.lastName.trim(),
    first_name: values.firstName.trim(),
    middle_name: values.middleName.trim(),
    birth_date: toApiDate(values.birthDate),
    birth_place: values.birthPlace.trim(),
    gender: values.gender,
    passport_series: values.passportSeries,
    passport_number: values.passportNumber,
    passport_issued_by: values.passportIssuedBy.trim(),
    passport_issued_date: toApiDate(values.passportIssuedDate),
    department_code: values.departmentCode,
    registration_address: citizen.registrationAddress,
    phone: values.phone.trim(),
    photo_url: values.photoUrl,
    notes: values.passportNote.trim()
  };
}

export function apiCitizenToCitizen(apiCitizen: ApiCitizen): Citizen {
  const nameParts = (apiCitizen.full_name ?? "").split(" ").filter(Boolean);
  const lastName = apiCitizen.last_name ?? nameParts[0] ?? "";
  const firstName = apiCitizen.first_name ?? nameParts[1] ?? "";
  const middleName = apiCitizen.middle_name ?? nameParts.slice(2).join(" ");
  const now = new Date().toISOString();

  return {
    id: String(apiCitizen.id ?? `${lastName}-${firstName}-${apiCitizen.passport_number ?? ""}`),
    lastName,
    firstName,
    middleName,
    birthDate: apiCitizen.birth_date ?? "",
    birthPlace: apiCitizen.birth_place ?? "",
    gender: apiCitizen.gender === "female" ? "female" : "male",
    passportSeries: apiCitizen.passport_series ?? "",
    passportNumber: apiCitizen.passport_number ?? "",
    passportIssuedBy: apiCitizen.passport_issued_by ?? "",
    passportIssuedDate: apiCitizen.passport_issued_date ?? "",
    departmentCode: apiCitizen.department_code ?? "",
    passportNote: apiCitizen.passport_note ?? apiCitizen.notes ?? "",
    registrationAddress: apiCitizen.registration_address ?? "",
    phone: apiCitizen.phone ?? "",
    photoUrl: apiCitizen.photo_url ?? apiCitizen.photo_path ?? "",
    stamps: apiStampsToStamps(apiCitizen.stamps ?? []),
    createdAt: apiCitizen.created_at ?? now,
    updatedAt: apiCitizen.updated_at ?? apiCitizen.created_at ?? now
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

function toApiDate(value: string) {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return value;
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}
