// Хук для получения списка пациентов
// Вся логика работы с данными здесь

import { Patient } from '../types';

// Placeholder - здесь будет RTK Query или другой способ получения данных
export function usePatients() {
  // TODO: реализовать через RTK Query
  return {
    data: [] as Patient[],
    isLoading: false,
    error: null,
  };
}

