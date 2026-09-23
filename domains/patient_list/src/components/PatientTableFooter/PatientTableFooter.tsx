'use client';

import * as React from 'react';
import { Pagination, Select, Space, Typography } from 'antd';

export type PatientTableFooterProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
};

function rangeText(page: number, pageSize: number, total: number) {
  if (total <= 0) return '0 из 0 пациентов';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${start}–${end} из ${total} пациентов`;
}

export function PatientTableFooter({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PatientTableFooterProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
      <Typography.Text type="secondary">{rangeText(page, pageSize, total)}</Typography.Text>

      <Pagination
        size="small"
        current={page}
        pageSize={pageSize}
        total={total}
        showSizeChanger={false}
        onChange={(p) => onPageChange?.(p)}
      />

      <Space size={8} align="center">
        <Select
          size="small"
          value={pageSize}
          onChange={(v) => onPageSizeChange?.(v)}
          options={pageSizeOptions.map((v) => ({ value: v, label: `${v} строк` }))}
          style={{ width: 110 }}
        />
      </Space>
    </div>
  );
}

