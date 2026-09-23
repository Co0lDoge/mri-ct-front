import * as React from "react";

import { useAppSelector } from "@medml/store";

import { getAccessTokenSubject } from "@/lib/jwtSubject";

/**
 * Doctor id for `/med/doctor/{id}/...` — из Redux access token (JWT).
 */
export function useDoctorId(): {
  doctorId: string;
  status: "authenticated" | "unauthenticated";
} {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const doctorId = React.useMemo(() => {
    if (!accessToken) return "";
    return getAccessTokenSubject(accessToken);
  }, [accessToken]);

  const status: "authenticated" | "unauthenticated" = accessToken
    ? "authenticated"
    : "unauthenticated";

  return { doctorId, status };
}
