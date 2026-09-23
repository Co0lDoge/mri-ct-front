/** Куда вести после входа и куда уводить с логина, если сессия уже есть */
export const DEFAULT_POST_AUTH_PATH = "/patients";

/** Куда редиректить с корня приложения, если нужна авторизация */
export const DEFAULT_LOGIN_ROUTE = "/auth/login";

/**
 * Паттерны для `middleware.config.matcher` (без `/auth/*` и `/api/auth/*`).
 * Приложение может расширить свой список.
 */
export const DEFAULT_PROTECTED_ROUTE_MATCHER = [
  "/",
  "/patients/:path*",
  "/upload_photo/:path*",
  "/doctor/:path*",
  "/faq/:path*",
] as const;
