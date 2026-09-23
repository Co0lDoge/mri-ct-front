import type { MessageInstance } from "antd/es/message/interface";
import { createContext, useContext } from "react";

export interface IMessageContext {
  messageApi: MessageInstance | null;
  setError: (text: string) => void;
}

const defaultValues: IMessageContext = {
  messageApi: null,
  setError: () => {},
};

const MessageContext = createContext<IMessageContext>(defaultValues);

const useMessages = () => {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error("useMessages must be used within MessageProvider");
  }

  return context;
};

export default MessageContext;
export { useMessages };
