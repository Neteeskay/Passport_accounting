import type { Citizen } from "@/types/citizen";
import type { HistoryRecord, Stamp } from "@/types/citizen";
import type { CitizenFormValues } from "@/lib/validation/citizen";

export function buildCitizenFromForm(values: CitizenFormValues): Citizen {
  const now = new Date().toISOString();
  const id = `citizen-${Math.random().toString(36).slice(2, 10)}`;

  return {
    id,
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
    registrationAddress: buildRegistrationAddress(values),
    phone: values.phone,
    photoUrl: values.photoUrl,
    stamps: buildPreviewStamps(values),
    registrationStamps: values.registrationStamps,
    children: values.children,
    marriageRecords: values.marriageRecords,
    militaryRecords: values.militaryRecords,
    foreignPassports: values.foreignPassports,
    nameChanges: values.nameChanges,
    historyRecords: buildHistory(values),
    createdAt: now,
    updatedAt: now
  };
}

export function updateCitizenFromForm(citizen: Citizen, values: CitizenFormValues): Citizen {
  return {
    ...buildCitizenFromForm(values),
    id: citizen.id,
    createdAt: citizen.createdAt,
    updatedAt: new Date().toISOString()
  };
}

export function mapCitizenToFormValues(citizen: Citizen): CitizenFormValues {
  return {
    lastName: citizen.lastName,
    firstName: citizen.firstName,
    middleName: citizen.middleName ?? "",
    birthDate: toDisplayDate(citizen.birthDate),
    birthPlace: citizen.birthPlace,
    gender: citizen.gender,
    passportSeries: citizen.passportSeries,
    passportNumber: citizen.passportNumber,
    passportIssuedBy: citizen.passportIssuedBy,
    passportIssuedDate: toDisplayDate(citizen.passportIssuedDate),
    departmentCode: citizen.departmentCode,
    passportNote: citizen.passportNote ?? "",
    phone: citizen.phone ?? "",
    photoUrl: citizen.photoUrl ?? "",
    registrationStamps:
      citizen.registrationStamps?.map((stamp) => ({
        ...stamp,
        date: toDisplayDate(stamp.date),
        apartment: stamp.apartment ?? ""
      })) ?? [],
    children:
      citizen.children?.map((child) => ({
        ...child,
        birthDate: toDisplayDate(child.birthDate),
        middleName: child.middleName ?? "",
        personalMark: child.personalMark ?? ""
      })) ?? [],
    marriageRecords:
      citizen.marriageRecords?.map((record) => ({
        ...record,
        date: toDisplayDate(record.date),
        spouseBirthDate: toDisplayDate(record.spouseBirthDate),
        spouseMiddleName: record.spouseMiddleName ?? ""
      })) ?? [],
    militaryRecords:
      citizen.militaryRecords?.map((record) => ({
        ...record,
        date: toDisplayDate(record.date)
      })) ?? [],
    foreignPassports:
      citizen.foreignPassports?.map((record) => ({
        ...record,
        issueDate: toDisplayDate(record.issueDate),
        note: record.note ?? ""
      })) ?? [],
    nameChanges:
      citizen.nameChanges?.map((record) => ({
        ...record,
        date: toDisplayDate(record.date),
        previousMiddleName: record.previousMiddleName ?? "",
        newMiddleName: record.newMiddleName ?? "",
        note: record.note ?? ""
      })) ?? [],
    historyRecords:
      citizen.historyRecords?.map((record) => ({
        ...record,
        issueDate: toDisplayDate(record.issueDate),
        note: record.note ?? ""
      })) ?? []
  };
}

function toDisplayDate(value?: string) {
  if (!value) {
    return "";
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU").format(date);
}

function buildPreviewStamps(values: CitizenFormValues): Stamp[] {
  const childStamp =
    values.children.length > 0
      ? {
          id: "children-preview",
          type: "marital_status" as const,
          date: values.children[0].birthDate || "",
          authority: "",
          comment: `${values.children.length} ребёнок${values.children.length > 1 ? "а" : ""}`
        }
      : null;

  const marriageStamp =
    values.marriageRecords.length > 0
      ? {
          id: "marriage-preview",
          type: "marital_status" as const,
          date: values.marriageRecords[0].date,
          authority: values.marriageRecords[0].authority,
          comment: "Брак"
        }
      : null;

  const militaryStamp =
    values.militaryRecords.length > 0
      ? {
          id: "military-preview",
          type: "military_duty" as const,
          date: values.militaryRecords[0].date,
          authority: values.militaryRecords[0].authority,
          comment:
            values.militaryRecords[0].status === "liable" ? "Воинская обязанность" : "Освобожден(а)"
        }
      : null;

  const registrationPreviewSource =
    values.registrationStamps.find((stamp) => stamp.type === "registration") ??
    values.registrationStamps[0];
  const registrationStamp = registrationPreviewSource
    ? {
        id: "registration-preview",
        type: registrationPreviewSource.type,
        date: registrationPreviewSource.date,
        authority: registrationPreviewSource.authority,
        comment:
          registrationPreviewSource.type === "registration" ? "Регистрация" : "Снят(а) с учёта"
      }
    : null;

  return [childStamp, marriageStamp, militaryStamp, registrationStamp].filter(Boolean) as Stamp[];
}

function buildHistory(values: CitizenFormValues): HistoryRecord[] {
  return values.historyRecords.filter(
    (entry) =>
      entry.event ||
      entry.series ||
      entry.number ||
      entry.departmentCode ||
      entry.issueDate ||
      entry.authority
  );
}

function buildRegistrationAddress(values: CitizenFormValues) {
  const stamp = values.registrationStamps.find((item) => item.type === "registration") ?? values.registrationStamps[0];

  if (!stamp) {
    return "";
  }

  return [
    stamp.locality,
    stamp.settlement,
    stamp.street ? `ул. ${stamp.street}` : "",
    stamp.house ? `д. ${stamp.house}` : "",
    stamp.apartment ? `кв. ${stamp.apartment}` : ""
  ]
    .filter(Boolean)
    .join(", ");
}
