import { Navigate, useLocation } from 'react-router-dom'

import { isJwtUsable } from '@medml/shared'
import { useAppSelector } from '@medml/store'
import { DEFAULT_LOGIN_ROUTE } from '@medml/auth'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
	const accessToken = useAppSelector(s => s.auth.accessToken)
	const refreshToken = useAppSelector(s => s.auth.refreshToken)
	const location = useLocation()

	const hasLiveSession = isJwtUsable(accessToken) || isJwtUsable(refreshToken)

	if (!hasLiveSession) {
		const callback = `${location.pathname}${location.search}`
		const search = callback && callback !== '/' ? `?callbackUrl=${encodeURIComponent(callback)}` : ''
		return <Navigate to={`${DEFAULT_LOGIN_ROUTE}${search}`} replace />
	}

	return children
}
