import { createContext, useContext } from "react";

export interface ILoadingContext {
  start: (action: string) => void;
  stop: (action: string) => void;
  stopAll: () => void;
}

const defaultValues: ILoadingContext = {
  start: () => {},
  stop: () => {},
  stopAll: () => {},
};

const LoadingContext = createContext<ILoadingContext>(defaultValues);

const useLoading = () => {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }

  return context;
};

export default LoadingContext;
export { useLoading };
