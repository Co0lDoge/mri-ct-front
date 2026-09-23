export type PatientRow = {
  id: string | number;
  /** Карта приёма (thyroid API: `patient_card` при загрузке УЗИ) */
  patientCardId?: string;

  fullName: string;
  avatarText?: string;

  policyNumber?: string;
  email?: string;

  /** Дата рождения (с бэка `birth_date`) */
  birthDate?: string;
  diagnosisLabel?: string;

  statusLabel?: string;
  statusTone?: 'success' | 'warning' | 'default';
};

export type PatientListSortOrder = 'ascend' | 'descend' | null;

export type PatientListSort = {
  key: keyof PatientRow | null;
  order: PatientListSortOrder;
};

