/**
 * Формат DD.MM.YYYY для дат с API.
 * Строки вида `YYYY-MM-DD` разбираются как календарная дата без сдвига UTC.
 */
export function formatApiDateToDisplay(raw: string | null | undefined): string | undefined {
  if (raw == null || String(raw).trim() === "") return undefined;
  const s = String(raw).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${d}.${m}.${y}`;
  }
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return undefined;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
