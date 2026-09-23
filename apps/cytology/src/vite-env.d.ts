/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `python` — Django-сервис цитологии, `go` — composition-api. */
  readonly VITE_CYTOLOGY_BACKEND?: "python" | "go";
  readonly VITE_API_BASE_URL?: string;
  /** База отдельного DZI-сервиса; в go-режиме не используется. */
  readonly VITE_DZI_API_BASE_URL?: string;
  readonly VITE_AUTH_REFRESH_PATH?: string;
  readonly VITE_AUTH_REFRESH_HEADER_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
