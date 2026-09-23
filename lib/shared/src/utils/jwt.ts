/**
 * Разбор JWT без проверки подписи.
 *
 * Нужен только для решений на клиенте: показать ли страницу или сразу увести
 * на вход. Доверять этим данным нельзя — подпись проверяет сервер.
 */

export type JwtPayload = Record<string, unknown> & {
	exp?: number
	sub?: string
	user_id?: string | number
	id?: string | number
}

function base64UrlDecode(value: string): string | null {
	try {
		const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
		const padded = base64.length % 4 === 0 ? base64 : base64 + '='.repeat(4 - (base64.length % 4))

		if (typeof atob === 'function') return atob(padded)

		const maybeBuffer = (globalThis as { Buffer?: { from(s: string, enc: string): { toString(enc: string): string } } })
			.Buffer
		if (maybeBuffer) return maybeBuffer.from(padded, 'base64').toString('utf8')

		return null
	} catch {
		return null
	}
}

/** Полезная нагрузка токена или `null`, если это не разбираемый JWT. */
export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
	if (!token) return null

	const part = token.split('.')[1]
	if (!part) return null

	const json = base64UrlDecode(part)
	if (!json) return null

	try {
		const parsed: unknown = JSON.parse(json)
		return parsed && typeof parsed === 'object' ? (parsed as JwtPayload) : null
	} catch {
		return null
	}
}

/**
 * Истёк ли токен.
 */
export function isJwtExpired(token: string | null | undefined, skewSeconds = 30): boolean {
	if (!token) return true

	const payload = decodeJwtPayload(token)
	if (!payload || typeof payload.exp !== 'number') return false

	const nowSeconds = Math.floor(Date.now() / 1000)
	return payload.exp <= nowSeconds + skewSeconds
}

/** Есть ли токен и жив ли он ещё. */
export function isJwtUsable(token: string | null | undefined, skewSeconds = 30): boolean {
	return Boolean(token) && !isJwtExpired(token, skewSeconds)
}
