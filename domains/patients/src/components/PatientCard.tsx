// Полная реализация карточки пациента
// Этот компонент содержит всю бизнес-логику отображения

'use client';

import { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  return (
    <div>
      <h3>
        {patient.firstName} {patient.lastName}
      </h3>
      <p>Дата рождения: {patient.dateOfBirth}</p>
      <p>Пол: {patient.gender}</p>
    </div>
  );
}

