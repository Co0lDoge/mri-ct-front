/**
 * Разрешён только внутренний путь (open redirect не допускаем).
 */
export function sanitizeInternalPath(raw: string | null | undefined): string | undefined {
  if (raw == null || typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return undefined;
  if (trimmed.includes("://")) return undefined;
  return trimmed;
}
