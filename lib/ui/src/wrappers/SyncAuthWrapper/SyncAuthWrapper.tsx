"use client";

import { setToken } from "@medml/store";
import { useAppDispatch } from "@medml/store";
import { useSession } from "next-auth/react";
import React, { ReactNode, useEffect } from "react";

interface SyncAuthWrapperProps {
  children: ReactNode;
}

const SyncAuthWrapper: React.FC<SyncAuthWrapperProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { data, status } = useSession();

  useEffect(() => {
    const accessToken = (data as { accessToken?: string } | null | undefined)?.accessToken;
    if (status === "authenticated" && accessToken) {
      dispatch(setToken(accessToken));
      return;
    }
    if (status === "unauthenticated") {
      dispatch(setToken(undefined));
    }
  }, [data, status, dispatch]);

  return <>{children}</>;
};

export default SyncAuthWrapper;
