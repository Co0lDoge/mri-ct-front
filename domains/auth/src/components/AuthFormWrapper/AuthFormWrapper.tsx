"use client";

import { Flex } from "antd";
import { PropsWithChildren } from "react";

import "./AuthFormWrapper.scss";

type AuthFormWrapperProps = PropsWithChildren;

const AuthFormWrapper = ({ children }: AuthFormWrapperProps) => {
  return (
    <Flex className="auth-form-wrapper">
      {children}
    </Flex>
  );
};

export default AuthFormWrapper;
