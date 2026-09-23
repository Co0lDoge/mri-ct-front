/**
 * Нормализованная модель для экрана «карта пациента».
 * Заполняется в приложении через `transformResponse` / мапперы из ответа бэка.
 */
export type PatientProfileViewModel = {
  id: string;
  fullName: string;
  email?: string;
  policyNumber?: string;
  /** Уже отформатированная дата рождения для отображения (например DD.MM.YYYY) */
  birthDate?: string;
  active: boolean;
  malignancy?: boolean;
  /**
   * Текст диагноза / заключения карты.
   * Если с бэка приходит объект — приложение само приводит к строке в transformResponse.
   */
  diagnosis?: string;
};
