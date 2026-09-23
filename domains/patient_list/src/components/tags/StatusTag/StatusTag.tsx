'use client';

import * as React from 'react';
import { Tag } from 'antd';

export type StatusTagTone = 'success' | 'warning' | 'default';

export type StatusTagProps = {
  tone?: StatusTagTone;
  children: React.ReactNode;
};

export function StatusTag({ tone = 'default', children }: StatusTagProps) {
  const color = tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'default';
  return <Tag color={color}>{children}</Tag>;
}

