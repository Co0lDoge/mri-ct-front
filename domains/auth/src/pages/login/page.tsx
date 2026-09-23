'use client'

import './page.scss'

import { useCallback, useState } from 'react'
import { Button, Form, Input } from 'antd'
import { EmailIcon, LogoMark, PasswordIcon } from '@medml/ui'
import { validateEmail } from '../../utils/validateEmail'
import AuthFormWrapper from '../../components/AuthFormWrapper'
import { useAuthError } from '../../contexts/AuthErrorContext'
import { useAuthApi } from '../../contexts/AuthApiContext'
import { DEFAULT_POST_AUTH_PATH } from '../../constants/routes'
import { sanitizeInternalPath } from '../../utils/sanitizeCallbackUrl'

const { Password } = Input

interface LoginFormData {
	email: string
	password: string
}

interface LoginPageProps {
	onSuccess?: () => void
	onError?: (error: string) => void
	/** Куда уйти, если пользователь уже авторизован (по умолчанию — список пациентов) */
	authedRedirectTo?: string
	/** Из query `callbackUrl` (передаётся из server page) */
	callbackUrl?: string | null
}

const LoginPage = ({ onSuccess, onError, authedRedirectTo = DEFAULT_POST_AUTH_PATH, callbackUrl }: LoginPageProps) => {
	const authApi = useAuthApi()
	const [form] = Form.useForm<LoginFormData>()
	const [disabledButton, setDisabledButton] = useState(true)
	const { hasError, setHasError, setErrorMessage } = useAuthError()

	const resolvedAfterLogin = sanitizeInternalPath(callbackUrl) ?? authedRedirectTo

	const handleSubmit = useCallback(
		async (values: LoginFormData) => {
			try {
				setHasError(false)
				setErrorMessage(null)

				await authApi.login({ email: values.email, password: values.password })

				setHasError(false)
				setErrorMessage(null)
				if (onSuccess) {
					onSuccess()
				} else {
					window.location.assign(resolvedAfterLogin)
				}
			} catch (error: unknown) {
				const errorMsg =
					(error as { data?: { detail?: string }; message?: string })?.data?.detail ??
					(error as { message?: string })?.message ??
					'Неверные данные'
				setHasError(true)
				setErrorMessage(errorMsg)
				if (onError) {
					onError(errorMsg)
				}
			}
		},
		[authApi, onSuccess, onError, setHasError, setErrorMessage, resolvedAfterLogin],
	)

	const checkFormValidity = useCallback(() => {
		form
			.validateFields()
			.then(() => {
				setDisabledButton(false)
				setHasError(false)
				setErrorMessage(null)
			})
			.catch((err: { errorFields?: Array<{ errors: string[] }> }) => {
				setDisabledButton(true)
				setHasError(true)
				const firstMessage = err?.errorFields?.[0]?.errors?.[0]
				setErrorMessage(firstMessage ?? null)
			})
	}, [form, setHasError, setErrorMessage])

	const handleValuesChange = useCallback(() => {
		setTimeout(() => checkFormValidity(), 0)
	}, [checkFormValidity])

	const handleFinishFailed = useCallback(
		({ errorFields }: { errorFields?: Array<{ errors: string[] }> }) => {
			setHasError(true)
			const firstMessage = errorFields?.[0]?.errors?.[0]
			setErrorMessage(firstMessage ?? 'Заполните поля корректно')
		},
		[setHasError, setErrorMessage],
	)

	return (
		<AuthFormWrapper>
			<div className='login-hero'>
				<div className='login-logo'>
					<LogoMark />
				</div>
				<h1 className='login-title'>Вход в систему</h1>
				<p className='login-subtitle'>Введите ваши данные для доступа</p>
			</div>

			<Form
				className='login-form'
				initialValues={{ email: '', password: '' }}
				form={form}
				onFinish={handleSubmit}
				onFinishFailed={handleFinishFailed}
				onValuesChange={handleValuesChange}
				layout='vertical'
			>
				<Form.Item
					label='Электронная почта'
					name='email'
					rules={[
						{ required: true, message: 'Введите электронную почту пользователя' },
						{
							validator: (_, value) => {
								if (!value || validateEmail(value)) {
									return Promise.resolve()
								}
								return Promise.reject(new Error('Неверный формат почты'))
							},
						},
					]}
				>
					<Input prefix={<EmailIcon />} type='email' size='large' placeholder='Email' />
				</Form.Item>

				<Form.Item label='Пароль' name='password' rules={[{ required: true, message: 'Введите пароль пользователя' }]}>
					<Password prefix={<PasswordIcon />} size='large' placeholder='Пароль' />
				</Form.Item>
				<Form.Item>
					<Button type='primary' htmlType='submit' size='large' block disabled={disabledButton}>
						{hasError ? 'Неверные данные' : 'Войти'}
					</Button>
				</Form.Item>
			</Form>
			<Button type='link' className='login-forgot-password'>
				Забыли пароль?
			</Button>
		</AuthFormWrapper>
	)
}

export default LoginPage
