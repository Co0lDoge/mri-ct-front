"use client";

import "../../styles/auth.scss";

import { PropsWithChildren, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAppSelector } from "@medml/store";

import AuthCard from "../AuthCard";
import { DEFAULT_POST_AUTH_PATH } from "../../constants/routes";
import { sanitizeInternalPath } from "../../utils/sanitizeCallbackUrl";

function getTokenSubject(accessToken: string | undefined): string {
  if (!accessToken) {
    return "";
  }
  try {
    const part = accessToken.split(".")[1];
    if (!part) return "";
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = atob(b64 + pad);
    const payload = JSON.parse(json) as Record<string, unknown>;
    const id =
      payload.sub ??
      payload.med_worker_id ??
      payload.user_id ??
      payload.doctor_id ??
      payload.id;
    return typeof id === "string" || typeof id === "number" ? String(id) : "";
  } catch {
    return "";
  }
}

/**
 * Обёртка страниц логина для SPA (Redux-токен + react-router), без NextAuth.
 */
const AuthLayoutSpa = ({ children }: PropsWithChildren) => {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const tokenSubject = getTokenSubject(accessToken);
  const isAuthorized = Boolean(accessToken && tokenSubject);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isAuthorized) return;
    const raw = searchParams.get("callbackUrl");
    const target = sanitizeInternalPath(raw) ?? DEFAULT_POST_AUTH_PATH;
    navigate(target, { replace: true });
  }, [isAuthorized, navigate, searchParams]);

  if (isAuthorized) {
    return (
      <div className="auth_pages">
        <AuthCard>
          <p className="auth-redirect-hint">Перенаправление…</p>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="auth_pages">
      <AuthCard>{children}</AuthCard>
    </div>
  );
};

export default AuthLayoutSpa;
