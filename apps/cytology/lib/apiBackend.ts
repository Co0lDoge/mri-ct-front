/**
 * Какой бэкенд обслуживает цитологию и тайлер.
 *
 * - `python` — прежний сервис (`/api/v3`, Django) плюс отдельный DZI-тайлер
 *   на своём порту (`/api/bid/v1/dzi`).
 * - `go` — composition-api: единый шлюз `/api/v1`, за которым и цитология,
 *   и тайлер (`/tiler/dzi/...`), и всё остальное.
 */
export type CytologyBackendVariant = 'python' | 'go'

export function getCytologyBackend(): CytologyBackendVariant {
	try {
		const value = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_CYTOLOGY_BACKEND
		if (value === 'go' || value === 'python') {
			return value
		}
	} catch {
		/* import.meta недоступен (SSR / тесты) — остаёмся на python */
	}
	return 'python'
}

export const isGoBackend = (): boolean => getCytologyBackend() === 'go'
