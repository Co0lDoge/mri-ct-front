import type { PatientCreateValuesCytology, PatientCreateValuesUzi } from "./types";

/** Склейка ФИО для UZI-эндпоинта `fullname`. */
export function buildFullNameUzi(v: PatientCreateValuesUzi): string {
  return [v.surname, v.name, v.patronymic]
    .map((s) => String(s ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

/** Склейка ФИО для цитологии (порядок: фамилия имя отчество). */
export function buildFullNameCytology(v: PatientCreateValuesCytology): string {
  return [v.lastName, v.firstName, v.fathersName]
    .map((s) => String(s ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

/** Универсальный номер полиса ОМС (РФ): 16 цифр; ввод/отображение — группы по 4. */
export const POLICY_OMS_DIGIT_COUNT = 16;

/** Длина строки с пробелами: `0000 0000 0000 0000`. */
export const POLICY_OMS_MASK_DISPLAY_LENGTH =
  POLICY_OMS_DIGIT_COUNT + Math.floor((POLICY_OMS_DIGIT_COUNT - 1) / 4);

/** Только цифры для отправки в API. */
export function stripPolicyDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

/** Форматирование полиса группами по 4 цифры (как в OLD_PROJECTS/CYTO). */
export function formatPolicySpaced16(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, POLICY_OMS_DIGIT_COUNT);
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && i % 4 === 0) out += " ";
    out += digits[i];
  }
  return out;
}
