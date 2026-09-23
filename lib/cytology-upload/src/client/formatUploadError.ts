/** Текст ошибки из ответа API / RTK Query для экрана загрузки. */
export function formatCytologyUploadApiError(error: unknown): string {
  const payload = extractUploadErrorPayload(error);
  const text = formatUploadErrorPayload(payload);
  return text ? `Не удалось отправить снимок: ${text}` : "Не удалось отправить снимок";
}

function extractUploadErrorPayload(error: unknown): unknown {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  if ("data" in error && (error as { data?: unknown }).data != null) {
    return (error as { data: unknown }).data;
  }
  return error;
}

function formatUploadErrorPayload(data: unknown): string | null {
  if (data == null) {
    return null;
  }
  if (typeof data === "string") {
    return data.length > 0 ? data : null;
  }
  if (typeof data !== "object" || Array.isArray(data)) {
    return String(data);
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.message === "string" && obj.message.length > 0) {
    return obj.message;
  }
  if (typeof obj.detail === "string" && obj.detail.length > 0) {
    return obj.detail;
  }

  if (obj.data != null) {
    const nested = formatUploadErrorPayload(obj.data);
    if (nested) {
      return nested;
    }
  }

  const skip = new Set(["success", "status", "data"]);
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (skip.has(key) || value == null) {
      continue;
    }
    if (Array.isArray(value)) {
      parts.push(`${key}: ${value.map(String).join(", ")}`);
    } else if (typeof value === "object") {
      parts.push(`${key}: ${JSON.stringify(value)}`);
    } else {
      parts.push(`${key}: ${String(value)}`);
    }
  }
  return parts.length > 0 ? parts.join("; ") : null;
}
