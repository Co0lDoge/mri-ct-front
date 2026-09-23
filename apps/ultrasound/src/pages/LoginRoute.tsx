import { useNavigate, useSearchParams } from 'react-router-dom'

import {
	AuthApiProvider,
	AuthLayoutSpa,
	DEFAULT_POST_AUTH_PATH,
	LoginPage,
	sanitizeInternalPath,
} from '@medml/auth'

import { useUltrasoundAuthApi } from '@/lib/authApiAdapter'

export default function LoginRoute() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const authApi = useUltrasoundAuthApi()

	const handleSuccess = () => {
		const raw = searchParams.get('callbackUrl')
		const target = sanitizeInternalPath(raw) ?? DEFAULT_POST_AUTH_PATH
		navigate(target, { replace: true })
	}

	return (
		<AuthApiProvider api={authApi}>
			<AuthLayoutSpa>
				<LoginPage onSuccess={handleSuccess} callbackUrl={searchParams.get('callbackUrl')} />
			</AuthLayoutSpa>
		</AuthApiProvider>
	)
}
