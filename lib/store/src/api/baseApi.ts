import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs } from '@reduxjs/toolkit/query/react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { isJwtExpired } from '@medml/shared'

import { prepareHeaders } from './headers'
import { setToken, setRefreshToken } from '../slices/authSlice'
import type { AuthState } from '../slices/authSlice'

const getViteApiBaseUrl = (): string | undefined => {
	try {
		const env = (import.meta as { env?: Record<string, string | undefined> }).env
		const url = env?.VITE_BACKEND_BASE_URL ?? env?.VITE_API_BASE_URL
		return typeof url === 'string' && url.length > 0 ? url : undefined
	} catch {
		return undefined
	}
}

const getBaseUrl = (): string => {
	const viteUrl = getViteApiBaseUrl()
	if (viteUrl) return viteUrl.endsWith('/') ? viteUrl : `${viteUrl}/`

	if (typeof process !== 'undefined' && process.env) {
		if (typeof window === 'undefined') {
			return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
		}
		return process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
	}

	return ''
}

const joinBase = (base: string, path: string): string => {
	const b = base.replace(/\/$/, '')
	const p = path.startsWith('/') ? path : `/${path}`
	return `${b}${p}`
}

const getViteEnv = (): Record<string, string | undefined> | undefined => {
	try {
		return (import.meta as { env?: Record<string, string | undefined> }).env
	} catch {
		return undefined
	}
}

const getAuthRefreshPath = (): string => getViteEnv()?.VITE_AUTH_REFRESH_PATH ?? '/auth/token/refresh/'

const refreshUsesTokenHeader = (): boolean => getViteEnv()?.VITE_AUTH_REFRESH_HEADER_TOKEN === 'true'

const rawBaseQuery = fetchBaseQuery({
	baseUrl: getBaseUrl(),
	prepareHeaders,
})

const isAuthFreePath = (path: string): boolean =>
	path.includes('/login') ||
	path.includes('/refresh') ||
	path.includes('/auth/register') ||
	// Go-шлюз: регистрация врача и пациента.
	path.includes('/reg/')

let refreshSingleton: Promise<void> | null = null

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions,
) => {
	let result = await rawBaseQuery(args, api, extraOptions)

	if (result.error?.status !== 401) {
		return result
	}

	const url = typeof args === 'string' ? args : args.url
	const path = typeof url === 'string' ? url : ''
	if (isAuthFreePath(path)) {
		return result
	}

	const auth = (api.getState() as { auth: AuthState }).auth
	const refresh = auth.refreshToken

	if (!refresh || isJwtExpired(refresh)) {
		if (refresh) {
			api.dispatch(setToken(undefined))
			api.dispatch(setRefreshToken(undefined))
		}
		return result
	}

	refreshSingleton ??= (async () => {
		const baseUrl = getBaseUrl()
		const refreshPath = getAuthRefreshPath()
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		const fetchInit: RequestInit = { method: 'POST', headers }

		if (refreshUsesTokenHeader()) {
			headers.token = refresh
		} else {
			fetchInit.body = JSON.stringify({ refresh, refresh_token: refresh })
		}

		const res = await fetch(joinBase(baseUrl, refreshPath), fetchInit)
		if (!res.ok) {
			api.dispatch(setToken(undefined))
			api.dispatch(setRefreshToken(undefined))
			return
		}
		const data = (await res.json()) as {
			access_token?: string
			refresh_token?: string
			access?: string
			refresh?: string
		}
		const accessToken = data.access_token ?? data.access ?? ''
		const newRefresh = data.refresh_token ?? data.refresh ?? refresh
		api.dispatch(setToken(accessToken))
		api.dispatch(setRefreshToken(newRefresh))
	})().finally(() => {
		refreshSingleton = null
	})

	await refreshSingleton
	result = await rawBaseQuery(args, api, extraOptions)
	return result
}

export const baseApi = createApi({
	reducerPath: 'api',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['MedWorker', 'Patient', 'Cytology', 'Auth', 'Segments', 'Uzi', 'Billing', 'Subscription'],
	endpoints: () => ({}),
})

export type BaseApi = typeof baseApi
export type ApiError = FetchBaseQueryError
