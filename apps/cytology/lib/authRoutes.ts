import type { LoginPayload, RegisterPayload } from '@medml/auth'

import { isGoBackend } from './apiBackend'

export const authRoutes = {
	/** POST — вход. Ответ в обоих случаях `{access_token, refresh_token}`. */
	login: (): string => (isGoBackend() ? '/login' : '/auth/login/'),

	/** POST — обновление пары токенов. */
	refresh: (): string => (isGoBackend() ? '/refresh' : '/auth/refresh'),

	/** POST — регистрация врача. */
	register: (): string => (isGoBackend() ? '/reg/doctor' : '/auth/register/'),
} as const

/** Тело запроса на вход. Формы совпадают, но пусть решение живёт рядом. */
export function buildLoginBody(payload: LoginPayload): Record<string, unknown> {
	return { email: payload.email, password: payload.password }
}

/**
 * Тело запроса на обновление токена.
 *
 * Django ждёт токен в заголовке `token`, Go — поле `refresh_token` в теле.
 * Поэтому возвращаем и то, и другое: вызывающий берёт нужное.
 */
export function buildRefreshRequest(token: string): {
	body?: Record<string, unknown>
	headers?: Record<string, string>
} {
	return isGoBackend() ? { body: { refresh_token: token } } : { headers: { token } }
}

/**
 * Тело регистрации врача.
 *
 * Формы полей разные: Django принимает ФИО по частям и два пароля,
 * Go — одну строку `fullname`, организацию и должность.
 */
export function buildRegisterBody(payload: RegisterPayload): Record<string, unknown> {
	if (!isGoBackend()) return { ...payload }

	const fullname = [payload.last_name, payload.first_name, payload.fathers_name]
		.map(part => part?.trim())
		.filter(Boolean)
		.join(' ')

	return {
		email: payload.email,
		password: payload.password1,
		fullname,
		org: payload.med_organization,
		job: '',
	}
}
