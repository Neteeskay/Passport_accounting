import type { Citizen } from "@/types/citizen";

export const mockCitizens: Citizen[] = [
  {
    id: "citizen-ivanov",
    lastName: "Иванов",
    firstName: "Иван",
    middleName: "Иванович",
    birthDate: "1990-03-13",
    birthPlace: "г. Донецк",
    gender: "male",
    passportSeries: "2323",
    passportNumber: "23232",
    passportIssuedBy: "выдан 18.03.2015",
    passportIssuedDate: "2015-03-18",
    departmentCode: "000-000",
    registrationAddress: "г. Донецк, ул. Пушкина, д.30, кв.30",
    actualAddress: "г. Донецк, ул. Пушкина, д.30, кв.30",
    phone: "",
    photoUrl: "",
    stamps: [
      {
        id: "stamp-child",
        type: "marital_status",
        date: "2026-03-28",
        authority: "ЗАГС",
        comment: "1 ребёнок"
      },
      {
        id: "stamp-marriage",
        type: "marital_status",
        date: "2026-03-28",
        authority: "ЗАГС",
        comment: "Брак"
      },
      {
        id: "stamp-military",
        type: "military_duty",
        date: "2026-03-28",
        authority: "Военный комиссариат",
        comment: "Воинская"
      },
      {
        id: "stamp-registration",
        type: "registration",
        date: "2026-03-28",
        authority: "МВД",
        comment: "1 насл."
      }
    ],
    createdAt: "2026-03-28T00:00:00.000Z",
    updatedAt: "2026-03-28T00:00:00.000Z"
  }
];
