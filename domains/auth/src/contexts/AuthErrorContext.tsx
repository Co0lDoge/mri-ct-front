"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AuthErrorContextType {
  hasError: boolean;
  setHasError: (value: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
}

const AuthErrorContext = createContext<AuthErrorContextType | undefined>(undefined);

export const AuthErrorProvider = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasErrorState] = useState(false);
  const [errorMessage, setErrorMessageState] = useState<string | null>(null);

  const setHasError = useCallback((value: boolean) => {
    setHasErrorState(value);
  }, []);

  const setErrorMessage = useCallback((message: string | null) => {
    setErrorMessageState(message);
  }, []);

  return (
    <AuthErrorContext.Provider
      value={{
        hasError,
        setHasError,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </AuthErrorContext.Provider>
  );
};

export const useAuthError = () => {
  const context = useContext(AuthErrorContext);
  if (!context) {
    throw new Error("useAuthError must be used within AuthErrorProvider");
  }
  return context;
};
