'use client';

import * as React from 'react';
import { Tag } from 'antd';

export type DiagnosisTagProps = {
  children: React.ReactNode;
};

export function DiagnosisTag({ children }: DiagnosisTagProps) {
  return <Tag color="processing">{children}</Tag>;
}

