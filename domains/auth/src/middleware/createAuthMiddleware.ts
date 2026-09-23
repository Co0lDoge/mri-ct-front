import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { DEFAULT_LOGIN_ROUTE, DEFAULT_POST_AUTH_PATH } from "../constants/routes";
import { sanitizeInternalPath } from "../utils/sanitizeCallbackUrl";

export type CreateAuthMiddlewareOptions = {
  /** Куда отправлять без сессии (по умолчанию /auth/login) */
  loginPath?: string;
  /** Куда с корня / при наличии сессии */
  afterAuthPath?: string;
  /**
   * Секрет JWT NextAuth для `getToken`.
   * Задавайте из `middleware.ts` приложения как `process.env.NEXTAUTH_SECRET`:
   * в Edge-бандле Next подставляет env только из entrypoint, не из транзитивных пакетов монорепы.
   */
  secret?: string;
};

async function readJwtToken(req: NextRequest, secret: string | undefined) {
  if (!secret) return null;
  // В Edge часто не подставляется `NEXTAUTH_URL` из node_modules → неверный префикс cookie.
  // Пробуем оба варианта имён cookie (http / https), как у NextAuth.
  let token = await getToken({ req, secret, secureCookie: false });
  if (!token) {
    token = await getToken({ req, secret, secureCookie: true });
  }
  return token;
}

/**
 * Общий middleware: защита маршрутов из `matcher` в приложении.
 * - `/` → при сессии `afterAuthPath`, без — `loginPath`
 * - остальные из matcher → без сессии редирект на логин с `callbackUrl`
 *
 * Маршруты `/auth/*` и `/api/auth/*` не должны попадать в `matcher`.
 */
export function createAuthMiddleware(options: CreateAuthMiddlewareOptions = {}) {
  const loginPath = options.loginPath ?? DEFAULT_LOGIN_ROUTE;
  const afterAuthPath = options.afterAuthPath ?? DEFAULT_POST_AUTH_PATH;
  const secret = options.secret ?? process.env.NEXTAUTH_SECRET;

  return async function authMiddleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    const token = await readJwtToken(req, secret);

    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = token ? afterAuthPath : loginPath;
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = loginPath;
      url.search = "";
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  };
}
