import type { ModalProps } from "antd";
import { createContext, type ReactNode } from "react";

export interface IModalConfig {
  content: ReactNode;
  props?: Omit<ModalProps, "open" | "onCancel">;
}

export interface IModalContext {
  open: (config: IModalConfig) => void;
  close: () => void;
  changeModalProps: (props: IModalConfig["props"]) => void;
}

const defaultValues: IModalContext = {
  open: () => {},
  close: () => {},
  changeModalProps: () => {},
};

const ModalContext = createContext<IModalContext>(defaultValues);

export default ModalContext;
