import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { DEFAULT_LOGIN_ROUTE } from "@medml/auth";
import {
  setToken,
  setRefreshToken as setRefreshTokenState,
  useAppDispatch,
  useAppSelector,
} from "@medml/store";

import { getSessionConfig, useGetSessionQuery, useRefreshTokenMutation } from "@/api/authApi";
import {
  clearAuthTokens,
  setAuthToken,
  setRefreshToken,
} from "@/lib/tokenStorage";

/**
 * 1) При VITE_SESSION_CHECK=true — GET проверка сессии (см. VITE_SESSION_PATH).
 * 2) Иначе при старте bootstrap-refresh ВЫКЛЮЧЕН по умолчанию и включается только через VITE_BOOTSTRAP_REFRESH=true.
 * 3) Любой 401 на API обрабатывает @medml/store baseQuery (refresh + повтор запроса).
 */
export default function SessionSync({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);

  const { enabled: sessionEnabled } = getSessionConfig();
  const skipSession = !sessionEnabled || !accessToken;

  useGetSessionQuery(undefined, {
    skip: skipSession,
    refetchOnMountOrArgChange: true,
  });

  const [refreshMutation] = useRefreshTokenMutation();
  const bootstrapDone = useRef(false);

  useEffect(() => {
    if (sessionEnabled) return;
    if (bootstrapDone.current) return;
    if (!accessToken || !refreshToken) return;
    if (import.meta.env.VITE_BOOTSTRAP_REFRESH !== "true") return;

    bootstrapDone.current = true;
    refreshMutation({ token: refreshToken })
      .unwrap()
      .then((data) => {
        dispatch(setToken(data.accessToken));
        dispatch(setRefreshTokenState(data.refreshToken));
        setAuthToken(data.accessToken);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
        }
      })
      .catch(() => {
        clearAuthTokens();
        dispatch(setToken(undefined));
        if (!location.pathname.startsWith("/auth")) {
          navigate(
            `${DEFAULT_LOGIN_ROUTE}?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`,
            { replace: true }
          );
        }
      });
  }, [
    sessionEnabled,
    accessToken,
    refreshToken,
    dispatch,
    navigate,
    location.pathname,
    location.search,
    refreshMutation,
  ]);

  return children;
}
