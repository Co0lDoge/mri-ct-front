'use client';

import * as React from 'react';

import type { PatientListSort, PatientListSortOrder } from '../types';

export type PatientListUiContextValue = {
  search: string;
  setSearch: (v: string) => void;

  page: number;
  setPage: (v: number) => void;

  pageSize: number;
  setPageSize: (v: number) => void;

  sort: PatientListSort;
  setSort: (v: PatientListSort) => void;
};

const PatientListUiContext = React.createContext<PatientListUiContextValue | null>(null);

export function PatientListUiProvider({
  children,
  initialSearch = '',
  initialPage = 1,
  initialPageSize = 10,
  initialSort = { key: null, order: null as PatientListSortOrder },
}: React.PropsWithChildren & {
  initialSearch?: string;
  initialPage?: number;
  initialPageSize?: number;
  initialSort?: PatientListSort;
}) {
  const [search, setSearch] = React.useState(initialSearch);
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [sort, setSort] = React.useState<PatientListSort>(initialSort);

  const value = React.useMemo<PatientListUiContextValue>(
    () => ({ search, setSearch, page, setPage, pageSize, setPageSize, sort, setSort }),
    [search, page, pageSize, sort]
  );

  return <PatientListUiContext.Provider value={value}>{children}</PatientListUiContext.Provider>;
}

export function usePatientListUi() {
  const ctx = React.useContext(PatientListUiContext);
  if (!ctx) {
    throw new Error('usePatientListUi must be used within PatientListUiProvider');
  }
  return ctx;
}

