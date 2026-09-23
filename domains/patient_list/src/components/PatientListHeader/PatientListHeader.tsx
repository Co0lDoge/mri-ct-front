'use client';

import * as React from 'react';
import { Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export type PatientListHeaderProps = {
  title?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  onAddClick?: () => void;
  addLabel?: React.ReactNode;
};

/**
 * Шапка карточки списка по макету «02 — Screens · Patients»:
 * заголовок 24/Bold слева, поиск (360) и сплошная navy-кнопка справа.
 */
export function PatientListHeader({
  title = 'Мои пациенты',
  searchPlaceholder = 'Поиск по имени или номеру полиса',
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onAddClick,
  addLabel = 'Новый пациент',
}: PatientListHeaderProps) {
  return (
    <div className="patients-panel__header">
      <h2 className="patients-panel__title">{title}</h2>

      <div className="patients-panel__tools">
        <Input
          className="patients-panel__search"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onPressEnter={() => onSearchSubmit?.(searchValue ?? '')}
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          allowClear
        />

        <Button type="primary" onClick={onAddClick}>
          + {addLabel}
        </Button>
      </div>
    </div>
  );
}
