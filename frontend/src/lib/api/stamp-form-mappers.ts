import type { CitizenStampPayload } from "@/lib/api/stamp-mappers";
import type { CitizenFormValues } from "@/lib/validation/citizen";

export type CitizenStampFormPayload = CitizenStampPayload & {
  formId: string;
};

export function citizenFormToStampPayloads(values: CitizenFormValues): CitizenStampFormPayload[] {
  return [
    ...values.historyRecords.map((record) => ({
      formId: record.id,
      stampCategory: "history" as const,
      stampType: record.event,
      stampPlacedAt: record.issueDate,
      stampAuthority: record.authority,
      stampNote: record.note,
      isActive: record.isCurrent,
      details: {
        series: record.series,
        number: record.number,
        departmentCode: record.departmentCode
      }
    })),
    ...values.registrationStamps.map((stamp) => ({
      formId: stamp.id,
      stampCategory: "registration" as const,
      stampType: stamp.type,
      stampPlacedAt: stamp.date,
      stampAuthority: stamp.authority,
      stampNote: buildRegistrationNote(stamp),
      isActive: stamp.type === "registration",
      details: {
        region: stamp.region,
        district: stamp.district,
        locality: stamp.locality,
        settlement: stamp.settlement,
        street: stamp.street,
        house: stamp.house,
        apartment: stamp.apartment ?? "",
        departmentCode: stamp.departmentCode,
        certifier: stamp.certifier
      }
    })),
    ...values.children.map((child) => ({
      formId: child.id,
      stampCategory: "children" as const,
      stampType: "birth_record",
      stampPlacedAt: child.birthDate,
      stampAuthority: "",
      stampNote: child.personalMark ?? "",
      isActive: true,
      details: {
        lastName: child.lastName,
        firstName: child.firstName,
        middleName: child.middleName ?? "",
        gender: child.gender,
        birthDate: child.birthDate,
        personalMark: child.personalMark ?? ""
      }
    })),
    ...values.marriageRecords.map((record) => ({
      formId: record.id,
      stampCategory: "marriage" as const,
      stampType: record.status,
      stampPlacedAt: record.date,
      stampAuthority: record.authority,
      stampNote: record.actRecordNumber,
      isActive: record.status === "registered",
      details: {
        spouseLastName: record.spouseLastName,
        spouseFirstName: record.spouseFirstName,
        spouseMiddleName: record.spouseMiddleName ?? "",
        spouseBirthDate: record.spouseBirthDate,
        actRecordNumber: record.actRecordNumber,
        certifier: record.certifier
      }
    })),
    ...values.militaryRecords.map((record) => ({
      formId: record.id,
      stampCategory: "military" as const,
      stampType: record.status,
      stampPlacedAt: record.date,
      stampAuthority: record.authority,
      stampNote: record.signedBy,
      isActive: record.status === "liable",
      details: {
        signedBy: record.signedBy
      }
    })),
    ...values.foreignPassports.map((record) => ({
      formId: record.id,
      stampCategory: "foreign_passport" as const,
      stampType: "issued",
      stampPlacedAt: record.issueDate,
      stampAuthority: record.authority,
      stampNote: record.note ?? "",
      isActive: true,
      details: {
        series: record.series,
        number: record.number
      }
    })),
    ...values.nameChanges.map((record) => ({
      formId: record.id,
      stampCategory: "name_change" as const,
      stampType: record.reason,
      stampPlacedAt: record.date,
      stampAuthority: record.authority,
      stampNote: record.note ?? "",
      isActive: true,
      details: {
        reason: record.reason,
        documentNumber: record.documentNumber,
        previousLastName: record.previousLastName,
        previousFirstName: record.previousFirstName,
        previousMiddleName: record.previousMiddleName ?? "",
        newLastName: record.newLastName,
        newFirstName: record.newFirstName,
        newMiddleName: record.newMiddleName ?? ""
      }
    }))
  ];
}

function buildRegistrationNote(stamp: CitizenFormValues["registrationStamps"][number]) {
  return [stamp.locality, stamp.street, stamp.house ? `д. ${stamp.house}` : "", stamp.apartment ? `кв. ${stamp.apartment}` : ""]
    .filter(Boolean)
    .join(", ");
}

