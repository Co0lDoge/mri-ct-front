/**
 * Профиль медработника в виде, готовом для отображения.
 *
 * Домен не знает, откуда пришли данные: маппинг из DTO бэкенда делает
 * приложение (в УЗИ — `apps/ultrasound/src/api/doctorApi.ts`).
 */
export type DoctorProfileViewModel = {
  id: string | number;
  /** ФИО одной строкой. */
  fullName: string;
  /** Инициалы для аватара. */
  initials: string;
  lastName: string;
  firstName: string;
  fathersName: string;
  /** Должность / специальность. */
  speciality?: string | null;
  /** Медицинская организация. */
  organization?: string | null;
  /** Готов давать экспертное заключение (удалённый эксперт). */
  isRemoteWorker: boolean;
  /** Опыт и сертификаты — свободный текст. */
  expertDetails: string;
};

/** Значения формы редактирования профиля. */
export type DoctorProfileFormValues = {
  lastName: string;
  firstName: string;
  fathersName: string;
  job: string;
  medOrganization: string;
  isRemoteWorker: boolean;
  expertDetails: string;
};
