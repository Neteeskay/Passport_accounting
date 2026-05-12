import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);
const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
const departmentCodePattern = /^\d{3}-\d{3}$/;

const dateText = (message: string) =>
  requiredText(message)
    .regex(datePattern, "Введите дату в формате дд.мм.гггг")
    .refine(isValidDate, "Введите корректную дату");

const optionalDateText = z
  .string()
  .trim()
  .refine((value) => !value || (datePattern.test(value) && isValidDate(value)), "Введите дату в формате дд.мм.гггг");

const passportSeriesText = requiredText("Введите серию паспорта").regex(/^\d{4}$/, "Серия паспорта — 4 цифры");
const passportNumberText = requiredText("Введите номер паспорта").regex(/^\d{6}$/, "Номер паспорта — 6 цифр");
const departmentCodeText = requiredText("Введите код подразделения").regex(
  departmentCodePattern,
  "Код подразделения — 6 цифр в формате 000-000"
);

export const registrationStampSchema = z.object({
  id: z.string(),
  type: z.enum(["registration", "deregistration"]),
  date: dateText("Укажите дату штампа"),
  region: requiredText("Укажите регион"),
  district: z.string().trim(),
  locality: requiredText("Укажите населённый пункт"),
  settlement: z.string().trim(),
  street: requiredText("Укажите улицу"),
  house: requiredText("Укажите дом"),
  apartment: z.string().trim(),
  authority: requiredText("Укажите подразделение"),
  departmentCode: departmentCodeText,
  certifier: requiredText("Укажите заверившее лицо")
});

export const childRecordSchema = z.object({
  id: z.string(),
  lastName: requiredText("Укажите фамилию ребёнка"),
  firstName: requiredText("Укажите имя ребёнка"),
  middleName: z.string().trim(),
  gender: z.enum(["male", "female"]),
  birthDate: dateText("Укажите дату рождения ребёнка"),
  personalMark: z.string().trim()
});

export const marriageRecordSchema = z.object({
  id: z.string(),
  status: z.enum(["registered", "dissolved"]),
  date: dateText("Укажите дату регистрации брака"),
  spouseLastName: requiredText("Укажите фамилию супруга или супруги"),
  spouseFirstName: requiredText("Укажите имя супруга или супруги"),
  spouseMiddleName: z.string().trim(),
  spouseBirthDate: optionalDateText,
  authority: requiredText("Укажите орган регистрации"),
  actRecordNumber: z.string().trim(),
  certifier: z.string().trim()
});

export const militaryRecordSchema = z.object({
  id: z.string(),
  status: z.enum(["liable", "exempt"]),
  authority: requiredText("Укажите военный комиссариат"),
  signedBy: requiredText("Укажите подпись или заверителя"),
  date: dateText("Укажите дату")
});

export const foreignPassportSchema = z.object({
  id: z.string(),
  issueDate: dateText("Укажите дату выдачи загранпаспорта"),
  series: requiredText("Укажите серию").regex(/^\d{2}$/, "Серия загранпаспорта — 2 цифры"),
  number: requiredText("Укажите номер").regex(/^\d{7}$/, "Номер загранпаспорта — 7 цифр"),
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
  date: dateText("Укажите дату смены ФИО"),
  authority: requiredText("Укажите орган регистрации"),
  note: z.string().trim()
});

export const historyRecordSchema = z.object({
  id: z.string(),
  event: requiredText("Укажите тип записи"),
  isCurrent: z.boolean(),
  series: passportSeriesText,
  number: passportNumberText,
  departmentCode: departmentCodeText,
  issueDate: dateText("Укажите дату выдачи"),
  authority: requiredText("Укажите орган"),
  note: z.string().trim()
});

export const citizenFormSchema = z.object({
  lastName: requiredText("Введите фамилию"),
  firstName: requiredText("Введите имя"),
  middleName: z.string().trim(),
  birthDate: dateText("Введите дату рождения"),
  birthPlace: requiredText("Введите место рождения"),
  gender: z.enum(["male", "female"]),
  passportSeries: passportSeriesText,
  passportNumber: passportNumberText,
  passportIssuedBy: requiredText("Введите кем выдан паспорт"),
  passportIssuedDate: dateText("Введите дату выдачи"),
  departmentCode: departmentCodeText,
  passportNote: z.string().trim(),
  phone: z.string().trim(),
  photoUrl: requiredText("Загрузите фото гражданина"),
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

function isValidDate(value: string) {
  const [day, month, year] = value.split(".").map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
