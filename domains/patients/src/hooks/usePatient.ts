// Хук для получения одного пациента
// Вся логика работы с данными здесь

import { Patient } from '../types';

export function usePatient(id: string) {
  // TODO: реализовать через RTK Query
  return {
    data: null as Patient | null,
    isLoading: false,
    error: null,
  };
}

