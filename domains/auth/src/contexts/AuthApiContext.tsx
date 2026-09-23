"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { IAuthApi } from "../types";

const AuthApiContext = createContext<IAuthApi | null>(null);

export interface AuthApiProviderProps {
  api: IAuthApi;
  children: ReactNode;
}

export const AuthApiProvider = ({ api, children }: AuthApiProviderProps) => (
  <AuthApiContext.Provider value={api}>{children}</AuthApiContext.Provider>
);

export const useAuthApi = (): IAuthApi => {
  const api = useContext(AuthApiContext);
  if (!api) {
    throw new Error("useAuthApi must be used within AuthApiProvider");
  }
  return api;
};
