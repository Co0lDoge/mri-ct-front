import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

/** Ответ бэкенда с полем `message` (типично для УЗИ). */
function messageFromData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const msg = d.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(msg) && msg.length && typeof msg[0] === "string") return msg.join(" ");
  const detail = d.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  return null;
}

/**
 * Текст ошибки для UI. Бэкенд УЗИ отдаёт описание в `message` в теле ответа.
 */
export function getRtkErrorMessage(error: unknown): string {
  if (error == null) return "Неизвестная ошибка";

  const e = error as FetchBaseQueryError;
  if (typeof e === "object" && e !== null && "status" in e) {
    if (e.status === "FETCH_ERROR" || e.status === "PARSING_ERROR" || e.status === "TIMEOUT_ERROR") {
      return typeof e.error === "string" ? e.error : "Ошибка сети";
    }

    const fromBody = messageFromData(e.data);
    if (fromBody) return fromBody;

    if (typeof e.status === "number") {
      return `Ошибка ${e.status}`;
    }
  }

  const se = error as SerializedError;
  if (typeof se?.message === "string" && se.message.trim()) {
    return se.message;
  }

  return "Не удалось выполнить запрос";
}
