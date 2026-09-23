'use client'

import { PropsWithChildren, useEffect } from 'react'
import { useSession } from 'next-auth/react'

import AuthCard from '../AuthCard'
import { DEFAULT_POST_AUTH_PATH } from '../../constants/routes'
import { sanitizeInternalPath } from '../../utils/sanitizeCallbackUrl'

const AuthLayout = ({ children }: PropsWithChildren) => {
	const { status } = useSession()

	useEffect(() => {
		if (status !== 'authenticated' || typeof window === 'undefined') return
		const raw = new URLSearchParams(window.location.search).get('callbackUrl')
		const target = sanitizeInternalPath(raw) ?? DEFAULT_POST_AUTH_PATH
		window.location.assign(target)
	}, [status])

	if (status === 'authenticated') {
		return (
			<div className='auth_pages'>
				<AuthCard>
					<p className='auth-redirect-hint'>Перенаправление…</p>
				</AuthCard>
			</div>
		)
	}

	return (
		<div className='auth_pages'>
			<AuthCard>{children}</AuthCard>
		</div>
	)
}

export default AuthLayout
