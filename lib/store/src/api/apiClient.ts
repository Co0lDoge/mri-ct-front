const getViteApiBaseUrl = (): string | undefined => {
	try {
		const env = (import.meta as { env?: Record<string, string | undefined> })
			.env
		const url = env?.VITE_BACKEND_BASE_URL ?? env?.VITE_API_BASE_URL
		return typeof url === 'string' && url.length > 0 ? url : undefined
	} catch {
		return undefined
	}
}

const getBaseUrl = (): string => {
	const viteUrl = getViteApiBaseUrl()
	if (viteUrl) return viteUrl

	if (typeof process !== 'undefined' && process.env) {
		if (typeof window === 'undefined') {
			return (
				process.env.API_BASE_URL ??
				process.env.NEXT_PUBLIC_API_BASE_URL ??
				'/api/v3'
			)
		}
		return process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v3'
	}

	return '/api/v3'
}

export interface ApiRequestOptions {
	url: string
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
	body?: unknown
	headers?: Record<string, string>
	token?: string
}

export const apiRequest = async <T>(options: ApiRequestOptions): Promise<T> => {
	const { url, method = 'GET', body, headers = {}, token } = options
	const baseUrl = getBaseUrl()
	const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
	const requestHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...headers,
	}
	if (token) {
		requestHeaders['Authorization'] = `Bearer ${token}`
	}
	const response = await fetch(fullUrl, {
		method,
		headers: requestHeaders,
		body: body ? JSON.stringify(body) : undefined,
	})
	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ message: 'Request failed' }))
		throw new Error(
			(error as { message?: string }).message ?? `HTTP ${response.status}`,
		)
	}
	return response.json()
}
