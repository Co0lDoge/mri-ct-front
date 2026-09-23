// Полная реализация списка пациентов
// Этот компонент содержит всю бизнес-логику

'use client';

import { usePatients } from '../hooks/usePatients';
import { PatientCard } from './PatientCard';

export function PatientList() {
  const { data: patients, isLoading, error } = usePatients();

  if (isLoading) {
    return <div>Загрузка пациентов...</div>;
  }

  if (error) {
    return <div>Ошибка загрузки пациентов</div>;
  }

  if (!patients || patients.length === 0) {
    return <div>Пациенты не найдены</div>;
  }

  return (
    <div>
      <h2>Список пациентов</h2>
      {patients.map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  );
}

