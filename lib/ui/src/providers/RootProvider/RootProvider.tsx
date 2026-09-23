'use client';

import { App } from 'antd';
import { Provider as ReduxProvider } from 'react-redux';
import { ReactNode, useMemo } from 'react';
import { SessionProvider } from 'next-auth/react';

import { createStore } from '@medml/store';
import type { Modality } from '@medml/shared';
import { Header, Footer } from '@medml/layout';


import { AntDesignProvider } from '../AntDesignProvider';

import '../../styles/global.scss';
import './RootProvider.scss';

export interface RootProviderProps {
  children: ReactNode;
  modality?: Modality;
  darkMode?: boolean;
}

export function RootProvider({
  children,
  modality,
  darkMode = false
}: RootProviderProps) {
  const store = useMemo(() => createStore(), []);

  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <AntDesignProvider modality={modality} darkMode={darkMode}>
          <App>
            <div className="root-layout">
              <Header />
              <main className="root-content">
                {children}
              </main>
              <Footer />
            </div>
          </App>
        </AntDesignProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}

