"use client";

import React from "react";

import { AuthErrorProvider } from "@medml/auth";
import { LoadingWrapper, MessageWrapper, ModalWrapper } from "@medml/ui";
import { RootProvider, SyncAuthWrapper } from "@medml/ui/next";

const RootLayoutClient = ({ children }: React.PropsWithChildren) => (
    <RootProvider modality="cytology">
      <LoadingWrapper>
        <MessageWrapper>
          <ModalWrapper>
            <SyncAuthWrapper>
              <AuthErrorProvider>{children}</AuthErrorProvider>
            </SyncAuthWrapper>
          </ModalWrapper>
        </MessageWrapper>
      </LoadingWrapper>
    </RootProvider>
);

export default RootLayoutClient;
