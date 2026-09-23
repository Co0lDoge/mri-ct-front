"use client";

import * as React from "react";
import { useAppSelector } from "@medml/store";

import { getAccessTokenSubject } from "./jwtSubject";

export function useDoctorId(): {
  doctorId: string;
  status: "authenticated" | "unauthenticated";
} {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const doctorId = React.useMemo(() => {
    if (!accessToken) return "";
    return getAccessTokenSubject(accessToken);
  }, [accessToken]);

  return {
    doctorId,
    status: accessToken ? "authenticated" : "unauthenticated",
  };
}
