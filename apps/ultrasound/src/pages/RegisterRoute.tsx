import { useNavigate, useSearchParams } from 'react-router-dom'

import {
	AuthApiProvider,
	AuthLayoutSpa,
	DEFAULT_POST_AUTH_PATH,
	RegisterPage,
	sanitizeInternalPath,
} from '@medml/auth'

import { useUltrasoundAuthApi } from '@/lib/authApiAdapter'

export default function RegisterRoute() {
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
				<RegisterPage onSuccess={handleSuccess} />
			</AuthLayoutSpa>
		</AuthApiProvider>
	)
}
