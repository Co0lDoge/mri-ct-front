'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';

import type { Modality } from '@medml/shared';

import { baseThemeConfig } from '../../theme/config';

export interface AntDesignProviderProps {
  children: ReactNode;
  /**
   * Использовать темную тему
   */
  darkMode?: boolean;
  /**
   * Модальность для применения специфичной темы
   */
  modality?: Modality;
}

export function AntDesignProvider({
  children,
  darkMode = false,
  modality
}: AntDesignProviderProps) {
  const themeConfig = {
    ...baseThemeConfig,
    algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <AntdRegistry>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
