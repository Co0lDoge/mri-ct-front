/**
 * Какой набор URL/мапперов использовать в ultrasound-app.
 *
 * - `thyroid` — thyroid-ultrasound-intelligent-assistant (api/v3, Django)
 * - `med` — legacy med API (как в cytology / старом med-сервисе: `/med/...`, `/uzis/external/...`)
 */
export type ApiBackendVariant = "thyroid" | "med";

export function getApiBackendVariant(): ApiBackendVariant {
  try {
    const v = (import.meta as { env?: Record<string, string | undefined> }).env
      ?.VITE_API_BACKEND;
    if (v === "med" || v === "thyroid") {
      return v;
    }
  } catch {
    /* ignore */
  }
  return "thyroid";
}

export const isThyroidBackend = (): boolean =>
  getApiBackendVariant() === "thyroid";
