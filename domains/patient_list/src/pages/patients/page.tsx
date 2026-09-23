'use client';

import * as React from 'react';

import { PatientListPanel, type PatientListPanelProps } from '../../components/PatientListPanel/PatientListPanel';
import type { PatientListSort, PatientListSortOrder, PatientRow } from '../../types';

export type PatientsPageProps = {
  title?: React.ReactNode;
  className?: string;

  rows?: PatientRow[];
  total?: number;
  isLoading?: boolean;
  emptyText?: React.ReactNode;

  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;

  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  sort?: PatientListSort;
  onSortChange?: (sort: PatientListSort) => void;

  onAddPatient?: () => void;
  onOpenPatientCard?: (id: PatientRow['id']) => void;
  /** @deprecated Не вызывается: в макете удаления из строки нет. */
  onDeletePatient?: (id: PatientRow['id']) => void;
};

export default function PatientsPage({
  title = 'Мои пациенты',
  className,
  rows = [],
  total,
  isLoading,
  emptyText,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortChange,
  onAddPatient,
  onOpenPatientCard,
  onDeletePatient,
}: PatientsPageProps) {
  const [internalSearch, setInternalSearch] = React.useState('');
  const [internalPage, setInternalPage] = React.useState(1);
  const [internalPageSize, setInternalPageSize] = React.useState(10);
  const [internalSort, setInternalSort] = React.useState<PatientListSort>({
    key: null,
    order: null as PatientListSortOrder,
  });

  const resolvedSearch = searchValue ?? internalSearch;
  const resolvedPage = page ?? internalPage;
  const resolvedPageSize = pageSize ?? internalPageSize;
  const resolvedSort = sort ?? internalSort;

  const panelProps: PatientListPanelProps = {
    className,
    title,
    rows,
    total: total ?? rows.length,
    isLoading,
    emptyText,
    page: resolvedPage,
    pageSize: resolvedPageSize,
    searchValue: resolvedSearch,
    onSearchChange: onSearchChange ?? setInternalSearch,
    onSearchSubmit: onSearchSubmit ?? (onSearchChange ?? setInternalSearch),
    onPageChange: onPageChange ?? setInternalPage,
    onPageSizeChange: onPageSizeChange ?? setInternalPageSize,
    sort: resolvedSort,
    onSortChange: onSortChange ?? setInternalSort,
    onAddPatient,
    onOpenPatientCard,
    onDeletePatient,
  };

  // Ширину колонки и внешние отступы задаёт PageShell на стороне приложения —
  // раньше страница сама навешивала Layout с maxWidth 1120, из-за чего не
  // совпадала с сеткой макета (1280).
  return <PatientListPanel {...panelProps} />;
}

