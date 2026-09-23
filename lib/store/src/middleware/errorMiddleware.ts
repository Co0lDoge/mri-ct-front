import { isRejectedWithValue, isRejected } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'
import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { message } from 'antd'

function textFromResponseData(data: unknown): string | null {
	if (!data || typeof data !== 'object') return null
	const d = data as Record<string, unknown>
	const msg = d.message
	if (typeof msg === 'string' && msg.trim()) return msg
	if (Array.isArray(msg) && msg.length && typeof msg[0] === 'string') return msg.join(' ')
	const detail = d.detail
	if (typeof detail === 'string' && detail.trim()) return detail
	if (Array.isArray(detail) && detail.length) {
		const first = detail[0]
		if (first && typeof first === 'object' && first !== null && 'msg' in first) {
			const m = (first as { msg?: unknown }).msg
			if (typeof m === 'string' && m.trim()) return m
		}
	}
	return null
}

function textFromPlainBody(data: unknown): string | null {
	if (typeof data !== 'string') return null

	const lines = data
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)

	if (lines.length === 0) return null

	const last = lines[lines.length - 1]
	return last.length > 200 ? `${last.slice(0, 200)}…` : last
}

function textFromRejectedPayload(payload: unknown): string | null {
	if (payload == null) return null
	const e = payload as FetchBaseQueryError
	if (typeof e === 'object' && e !== null && 'status' in e) {
		// Сеть недоступна: сервер не поднят, не тот порт, упал прокси.
		if (e.status === 'FETCH_ERROR') {
			return 'Не удалось связаться с сервером. Проверьте, что бэкенд запущен.'
		}

		if (e.status === 'TIMEOUT_ERROR') {
			return 'Сервер не ответил вовремя. Попробуйте ещё раз.'
		}

		if (e.status === 'PARSING_ERROR') {
			const status = e.originalStatus
			const fromBody = textFromPlainBody(e.data)

			if (fromBody && !fromBody.startsWith('<')) {
				return `Ошибка на сервере (${status}): ${fromBody}`
			}

			return `Сервер вернул неожиданный ответ (${status}). Подробности — в консоли и логах бэкенда.`
		}

		const fromBody = textFromResponseData(e.data) ?? textFromPlainBody(e.data)
		if (fromBody) return fromBody
	}
	return null
}

const DEDUPE_MS = 3000

const lastShownAt = new Map<string, number>()

function showOnce(text: string): void {
	const now = Date.now()
	const previous = lastShownAt.get(text)

	if (previous != null && now - previous < DEDUPE_MS) return

	lastShownAt.set(text, now)
	message.error(text)

	// Карта не должна расти бесконечно в долгой сессии.
	if (lastShownAt.size > 50) {
		for (const [key, at] of lastShownAt) {
			if (now - at >= DEDUPE_MS) lastShownAt.delete(key)
		}
	}
}

/**
 * Запрос, который не отправлялся или был прерван, — не ошибка.
 */
function isSilentRejection(action: unknown): boolean {
	const meta = (action as { meta?: { condition?: boolean; aborted?: boolean } }).meta
	if (meta?.condition || meta?.aborted) return true

	const error = (action as { error?: SerializedError }).error
	return error?.name === 'AbortError' || error?.name === 'ConditionError'
}

const errorMiddleware: Middleware = () => next => action => {
	if (isSilentRejection(action)) {
		return next(action)
	}

	if (isRejectedWithValue(action)) {
		const text = textFromRejectedPayload(action.payload) ?? 'Что-то пошло не так'
		showOnce(text)
	} else if (isRejected(action)) {
		const se = action.error as SerializedError | undefined
		const fromSerialized = typeof se?.message === 'string' && se.message.trim() ? se.message : null
		showOnce(fromSerialized ?? 'Что-то пошло не так')
	}

	return next(action)
}

export default errorMiddleware
