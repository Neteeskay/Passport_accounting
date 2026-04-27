export type StampType =
  | "registration"
  | "deregistration"
  | "marital_status"
  | "military_duty";

export type Stamp = {
  id: string;
  type: StampType;
  date: string;
  authority: string;
  comment?: string;
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
  registrationAddress: string;
  actualAddress?: string;
  phone?: string;
  photoUrl?: string;
  stamps: Stamp[];
  createdAt: string;
  updatedAt: string;
};
