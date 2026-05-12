import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const registrationStampSchema = z.object({
  id: z.string(),
  type: z.enum(["registration", "deregistration"]),
  date: requiredText("Укажите дату штампа"),
  region: requiredText("Укажите регион"),
  district: z.string().trim(),
  locality: requiredText("Укажите населённый пункт"),
  settlement: z.string().trim(),
  street: requiredText("Укажите улицу"),
  house: requiredText("Укажите дом"),
  apartment: z.string().trim(),
  authority: requiredText("Укажите подразделение"),
  departmentCode: requiredText("Укажите код подразделения"),
  certifier: requiredText("Укажите заверившее лицо")
});

export const childRecordSchema = z.object({
  id: z.string(),
  lastName: requiredText("Укажите фамилию ребёнка"),
  firstName: requiredText("Укажите имя ребёнка"),
  middleName: z.string().trim(),
  gender: z.enum(["male", "female"]),
  birthDate: requiredText("Укажите дату рождения ребёнка"),
  personalMark: z.string().trim()
});

export const marriageRecordSchema = z.object({
  id: z.string(),
  status: z.enum(["registered", "dissolved"]),
  date: requiredText("Укажите дату регистрации брака"),
  spouseLastName: requiredText("Укажите фамилию супруга или супруги"),
  spouseFirstName: requiredText("Укажите имя супруга или супруги"),
  spouseMiddleName: z.string().trim(),
  spouseBirthDate: z.string().trim(),
  authority: requiredText("Укажите орган регистрации"),
  actRecordNumber: z.string().trim(),
  certifier: z.string().trim()
});

export const militaryRecordSchema = z.object({
  id: z.string(),
  status: z.enum(["liable", "exempt"]),
  authority: requiredText("Укажите военный комиссариат"),
  signedBy: requiredText("Укажите подпись или заверителя"),
  date: requiredText("Укажите дату")
});

export const foreignPassportSchema = z.object({
  id: z.string(),
  issueDate: requiredText("Укажите дату выдачи загранпаспорта"),
  series: requiredText("Укажите серию"),
  number: requiredText("Укажите номер"),
  authority: requiredText("Укажите орган выдачи"),
  note: z.string().trim()
});

export const nameChangeSchema = z.object({
  id: z.string(),
  reason: requiredText("Укажите причину смены ФИО"),
  documentNumber: requiredText("Укажите номер документа"),
  previousLastName: requiredText("Укажите прежнюю фамилию"),
  previousFirstName: requiredText("Укажите прежнее имя"),
  previousMiddleName: z.string().trim(),
  newLastName: requiredText("Укажите новую фамилию"),
  newFirstName: requiredText("Укажите новое имя"),
  newMiddleName: z.string().trim(),
  date: requiredText("Укажите дату смены ФИО"),
  authority: requiredText("Укажите орган регистрации"),
  note: z.string().trim()
});

export const historyRecordSchema = z.object({
  id: z.string(),
  event: requiredText("Укажите тип записи"),
  isCurrent: z.boolean(),
  series: requiredText("Укажите серию"),
  number: requiredText("Укажите номер"),
  departmentCode: requiredText("Укажите код подразделения"),
  issueDate: requiredText("Укажите дату выдачи"),
  authority: requiredText("Укажите орган"),
  note: z.string().trim()
});

export const citizenFormSchema = z.object({
  lastName: requiredText("Введите фамилию"),
  firstName: requiredText("Введите имя"),
  middleName: z.string().trim(),
  birthDate: requiredText("Введите дату рождения"),
  birthPlace: requiredText("Введите место рождения"),
  gender: z.enum(["male", "female"]),
  passportSeries: requiredText("Введите серию паспорта"),
  passportNumber: requiredText("Введите номер паспорта"),
  passportIssuedBy: requiredText("Введите кем выдан паспорт"),
  passportIssuedDate: requiredText("Введите дату выдачи"),
  departmentCode: requiredText("Введите код подразделения"),
  passportNote: z.string().trim(),
  phone: z.string().trim(),
  photoUrl: z.string().trim(),
  registrationStamps: z.array(registrationStampSchema),
  children: z.array(childRecordSchema),
  marriageRecords: z.array(marriageRecordSchema),
  militaryRecords: z.array(militaryRecordSchema),
  foreignPassports: z.array(foreignPassportSchema),
  nameChanges: z.array(nameChangeSchema),
  historyRecords: z.array(historyRecordSchema)
});

export type CitizenFormValues = z.infer<typeof citizenFormSchema>;

export const citizenFormDefaultValues: CitizenFormValues = {
  lastName: "",
  firstName: "",
  middleName: "",
  birthDate: "",
  birthPlace: "",
  gender: "male",
  passportSeries: "",
  passportNumber: "",
  passportIssuedBy: "",
  passportIssuedDate: "",
  departmentCode: "",
  passportNote: "",
  phone: "",
  photoUrl: "",
  registrationStamps: [
    
  ],
  children: [],
  marriageRecords: [],
  militaryRecords: [],
  foreignPassports: [],
  nameChanges: [],
  historyRecords: []
};
