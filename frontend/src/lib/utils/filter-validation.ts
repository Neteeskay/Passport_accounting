import { digitsOnly, formatDateInput } from "@/lib/utils/input-format";

export function formatPassportFilterInput(value: string) {
  const digits = digitsOnly(value, 10);
  const series = digits.slice(0, 4);
  const number = digits.slice(4, 10);

  return [series, number].filter(Boolean).join(" ");
}

export function formatBirthDateFilterInput(value: string) {
  return formatDateInput(value);
}

export function getBirthDateFilterError(value: string) {
  if (!value) {
    return "";
  }

  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    return "Введите дату в формате дд.мм.гггг";
  }

  const date = parseRussianDate(value);

  if (!date) {
    return "Введите корректную дату";
  }

  if (date > startOfToday()) {
    return "Дата рождения не может быть позже текущей даты";
  }

  return "";
}

export function isValidBirthDateFilter(value: string) {
  return !getBirthDateFilterError(value);
}

export function toApiDateFilter(value: string) {
  if (!isValidBirthDateFilter(value) || !value) {
    return undefined;
  }

  const [day, month, year] = value.split(".");

  return `${year}-${month}-${day}`;
}

function parseRussianDate(value: string) {
  const [day, month, year] = value.split(".").map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function startOfToday() {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
}
