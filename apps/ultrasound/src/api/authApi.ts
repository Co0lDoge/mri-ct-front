import { baseApi } from "@medml/store";
import type {
  RegisterPayload,
  LoginPayload,
  RefreshTokenPayload,
  AuthLoginResponse,
} from "@medml/auth";

/**
 * Опциональный GET «проверки сессии» на бэкенде.
 *
 * В Next.js «сессия» жила в NextAuth (`GET /api/auth/session`) — это не бэкенд.
 * В OLD-PROJECTS/UZI к API уходят только `login` и `refresh` — отдельного `/session` нет,
 * поэтому по умолчанию GET не вызываем (иначе 404).
 *
 * Включить явно: `VITE_SESSION_CHECK=true` и при необходимости `VITE_SESSION_PATH=/users/me/`.
 */
export function getSessionConfig(): { enabled: boolean; path: string } {
  try {
    const env = (import.meta as { env?: Record<string, string | undefined> }).env;
    if (env?.VITE_SESSION_CHECK !== "true") {
      return { enabled: false, path: "" };
    }
    const custom = env?.VITE_SESSION_PATH;
    if (typeof custom === "string" && custom.length > 0) {
      return { enabled: true, path: custom };
    }
    return { enabled: true, path: "/session" };
  } catch {
    return { enabled: false, path: "" };
  }
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<void, RegisterPayload>({
      query: (payload) => ({
        url: "/auth/register/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, error) =>
        error ? [] : ["Auth", "MedWorker"],
    }),
    login: builder.mutation<AuthLoginResponse, LoginPayload>({
      query: (payload) => ({
        url: "/auth/login/",
        method: "POST",
        body: {
          email: payload.email,
          username: payload.email,
          password: payload.password,
        },
      }),
      transformResponse: (
        response: {
          access_token?: string;
          refresh_token?: string;
          access?: string;
          refresh?: string;
        }
      ): AuthLoginResponse => {
        const accessToken = response.access_token ?? response.access ?? "";
        const refreshToken = response.refresh_token ?? response.refresh ?? "";
        return { accessToken, refreshToken };
      },
    }),
    refreshToken: builder.mutation<AuthLoginResponse, RefreshTokenPayload>({
      query: (payload) => ({
        url: "/auth/token/refresh/",
        method: "POST",
        body: {
          refresh: payload.token,
        },
      }),
      transformResponse: (raw: {
        access_token?: string;
        refresh_token?: string;
        access?: string;
        refresh?: string;
      }): AuthLoginResponse => ({
        accessToken: raw.access_token ?? raw.access ?? "",
        refreshToken: raw.refresh_token ?? raw.refresh ?? "",
      }),
    }),
    /** Проверка сессии по access token (ожидается 200 при валидном JWT). */
    getSession: builder.query<Record<string, unknown>, void>({
      query: () => {
        const { path } = getSessionConfig();
        return { url: path, method: "GET" };
      },
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useGetSessionQuery,
  useLazyGetSessionQuery,
} = authApi;
