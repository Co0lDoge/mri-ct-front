"use client";

import { App } from "antd";
import { Provider as ReduxProvider } from "react-redux";
import { ReactNode, useMemo } from "react";

import { createStore } from "@medml/store";
import type { Modality } from "@medml/shared";
import { Footer } from "@medml/layout";
import { HeaderNext, type HeaderNextProps } from "@medml/layout/next";

import { AntDesignProvider } from "../AntDesignProvider";

import "../../styles/global.scss";
import "../RootProvider/RootProvider.scss";

export interface RootProviderReduxProps {
  children: ReactNode;
  modality?: Modality;
  darkMode?: boolean;
  onLogoutClearStorage?: HeaderNextProps["onLogoutClearStorage"];
}

export function RootProviderRedux({
  children,
  modality,
  darkMode = false,
  onLogoutClearStorage,
}: RootProviderReduxProps) {
  const store = useMemo(() => createStore(), []);

  return (
    <ReduxProvider store={store}>
      <AntDesignProvider modality={modality} darkMode={darkMode}>
        <App>
          <div className="root-layout">
            <HeaderNext onLogoutClearStorage={onLogoutClearStorage} />
            <main className="root-content">{children}</main>
            <Footer />
          </div>
        </App>
      </AntDesignProvider>
    </ReduxProvider>
  );
}
