"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "antd";

import { ModalContext } from "../../contexts";
import type { IModalConfig } from "../../contexts";

import "./ModalWrapper.scss";

interface ModalWrapperProps {
  children: ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const [config, setConfig] = useState<IModalConfig | undefined>(undefined);

  const open = (config: IModalConfig) => {
    setOpened(true);
    setConfig(config);
  };

  const close = () => {
    setOpened(false);
    setConfig(undefined);
  };

  const changeModalProps = (props: IModalConfig["props"]) => {
    setConfig((prev) => (prev ? { ...prev, props } : undefined));
  };

  return (
    <ModalContext.Provider value={{ open, close, changeModalProps }}>
      {children}
      <Modal
        open={opened}
        {...config?.props}
        onCancel={close}
        destroyOnHidden
        className="modal-container"
      >
        {config?.content}
      </Modal>
    </ModalContext.Provider>
  );
};

export default ModalWrapper;
