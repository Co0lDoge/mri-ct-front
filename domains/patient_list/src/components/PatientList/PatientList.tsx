'use client';

import * as React from 'react';

export type PatientListPatient = {
  id: string | number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | string;
};

export type PatientListProps = {
  title?: React.ReactNode;
  className?: string;
  patients?: PatientListPatient[];
  isLoading?: boolean;
  error?: unknown;

  emptyText?: React.ReactNode;
  loadingText?: React.ReactNode;
  errorText?: React.ReactNode;

  onPatientClick?: (patient: PatientListPatient) => void;
};

export function PatientList(props: PatientListProps) {
  const {
    title = 'Список пациентов',
    className,
    patients: patientsProp,
    isLoading: isLoadingProp,
    error: errorProp,
    emptyText = 'Пациенты не найдены',
    loadingText = 'Загрузка пациентов...',
    errorText = 'Ошибка загрузки пациентов',
    onPatientClick,
  } = props;

  const patients = patientsProp ?? [];
  const isLoading = Boolean(isLoadingProp);
  const error = errorProp ?? null;

  if (isLoading) return <div className={className}>{loadingText}</div>;
  if (error) return <div className={className}>{errorText}</div>;
  if (!patients?.length) return <div className={className}>{emptyText}</div>;

  return (
    <section className={className}>
      {title ? <h2>{title}</h2> : null}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {patients.map((p) => (
          <li key={p.id} style={{ padding: 12, borderBottom: '1px solid #eee' }}>
            <button
              type="button"
              onClick={onPatientClick ? () => onPatientClick(p) : undefined}
              style={{
                all: 'unset',
                cursor: onPatientClick ? 'pointer' : 'default',
                display: 'block',
                width: '100%',
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {p.lastName} {p.firstName}
              </div>
              <div style={{ opacity: 0.8, fontSize: 12 }}>
                {p.dateOfBirth ? `Дата рождения: ${p.dateOfBirth}` : null}
                {p.gender ? ` • Пол: ${p.gender}` : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

