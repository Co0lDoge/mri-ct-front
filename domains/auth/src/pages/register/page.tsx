'use client'

import './page.scss'

import { useCallback, useState } from 'react'
import { Badge, Button, Checkbox, Col, Form, Input, Row, Space } from 'antd'

import { EmailIcon, PasswordIcon, UserIcon } from '@medml/ui'

import { useAuthApi } from '../../contexts/AuthApiContext'
import { validateEmail } from '../../utils/validateEmail'
import { validatePassword } from '../../utils/validatePassword'
import AuthFormWrapper from '../../components/AuthFormWrapper'
import { useAuthError } from '../../contexts/AuthErrorContext'
import { DEFAULT_POST_AUTH_PATH } from '../../constants/routes'

const { Password } = Input

interface RegisterFormData {
	lastName: string
	firstName: string
	fathersName: string
	medOrganization: string
	email: string
	password: string
	confirmPassword: string
	termsAccepted: boolean
}

interface RegisterPageProps {
	onSuccess?: () => void
	onError?: (error: string) => void
	authedRedirectTo?: string
}

const RegisterPage = ({ onSuccess, onError, authedRedirectTo = DEFAULT_POST_AUTH_PATH }: RegisterPageProps) => {
	const authApi = useAuthApi()
	const [form] = Form.useForm<RegisterFormData>()
	const [disabledButton, setDisabledButton] = useState(true)
	const password = Form.useWatch('password', form)
	const { hasError, setHasError, setErrorMessage } = useAuthError()
	const [isRegisterLoading, setIsRegisterLoading] = useState(false)

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

	const handleSubmit = useCallback(
		async (values: RegisterFormData) => {
			try {
				setHasError(false)
				setErrorMessage(null)
				setIsRegisterLoading(true)

				// Раньше ФИО собиралось из одного поля разбором по пробелам, а
				// med_organization уходил пустой строкой — DRF отклонял её
				// (поле required, allow_blank=False). Теперь поля раздельные.
				await authApi.register({
					email: values.email.trim(),
					last_name: values.lastName.trim(),
					first_name: values.firstName.trim(),
					fathers_name: values.fathersName.trim(),
					med_organization: values.medOrganization.trim(),
					password1: values.password,
					password2: values.confirmPassword,
				})

				await authApi.login({ email: values.email, password: values.password })

				setHasError(false)
				setErrorMessage(null)
				if (onSuccess) {
					onSuccess()
				} else {
					window.location.assign(authedRedirectTo)
				}
			} catch (error: unknown) {
				const err = error as { data?: { detail?: string; message?: string } }
				const errorMsg = err?.data?.detail ?? err?.data?.message ?? 'Неверные данные'
				setHasError(true)
				setErrorMessage(errorMsg)
				if (onError) {
					onError(errorMsg)
				}
			} finally {
				setIsRegisterLoading(false)
			}
		},
		[authApi, onSuccess, onError, setHasError, setErrorMessage, authedRedirectTo],
	)

	const passwordRules = useCallback(
		(ruleNumber: number) => {
			if (!password || password.length === 0) {
				return 'default'
			}

			if (
				(ruleNumber === 1 && password.length < 8) ||
				(ruleNumber === 2 && !/[A-Z]/.test(password)) ||
				(ruleNumber === 3 && !/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/~`]/.test(password))
			) {
				return 'warning'
			}

			if (
				(ruleNumber === 1 && password.length >= 8) ||
				(ruleNumber === 2 && /[A-Z]/.test(password)) ||
				(ruleNumber === 3 && /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/~`]/.test(password))
			) {
				return 'success'
			}

			return 'default'
		},
		[password],
	)

	return (
		<AuthFormWrapper>
			<Form
				className='register-form'
				form={form}
				onFinish={handleSubmit}
				onFinishFailed={handleFinishFailed}
				onValuesChange={handleValuesChange}
				layout='vertical'
			>
				{/* По макету «SignUp» поля идут в две колонки. */}
				<Row gutter={16}>
					<Col xs={24} sm={12}>
						<Form.Item
							label='Фамилия'
							name='lastName'
							rules={[{ required: true, message: 'Введите фамилию' }]}
						>
							<Input prefix={<UserIcon />} size='large' placeholder='Иванов' />
						</Form.Item>
					</Col>

					<Col xs={24} sm={12}>
						<Form.Item
							label='Имя'
							name='firstName'
							rules={[{ required: true, message: 'Введите имя' }]}
						>
							<Input size='large' placeholder='Иван' />
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={24} sm={12}>
						<Form.Item
							label='Отчество'
							name='fathersName'
							rules={[{ required: true, message: 'Введите отчество' }]}
						>
							<Input size='large' placeholder='Иванович' />
						</Form.Item>
					</Col>

					<Col xs={24} sm={12}>
						<Form.Item
							label='Организация'
							name='medOrganization'
							rules={[{ required: true, message: 'Укажите организацию' }]}
						>
							<Input size='large' placeholder='Клиника №1' />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					label='Электронная почта'
					name='email'
					rules={[
						{ required: true, message: 'Введите электронную почту' },
						{
							validator: (_, value) => {
								if (!value || validateEmail(value)) {
									return Promise.resolve()
								}
								return Promise.reject(new Error('Введите электронную почту'))
							},
						},
					]}
				>
					<Input prefix={<EmailIcon />} type='email' size='large' placeholder='example@mail.ru' />
				</Form.Item>

				<Form.Item
					label='Пароль'
					name='password'
					rules={[
						{ required: true, message: 'Введите пароль' },
						{
							validator: (_, value) => {
								if (!value) {
									return Promise.resolve()
								}
								const validation = validatePassword(value)
								if (validation.isValid) {
									return Promise.resolve()
								}
								return Promise.reject(new Error('Введите пароль'))
							},
						},
					]}
				>
					<Password prefix={<PasswordIcon />} size='large' placeholder='Пароль' />
				</Form.Item>

				<Space direction='vertical' className='password-rules'>
					<Badge status={passwordRules(1)} text='Не менее 8 символов' />
					<Badge status={passwordRules(2)} text='Минимум одна заглавная буква' />
					<Badge status={passwordRules(3)} text='Минимум один спецсимвол (!, %, #, и т.д.)' />
				</Space>

				<Form.Item
					label='Повторите пароль'
					name='confirmPassword'
					dependencies={['password']}
					rules={[
						{ required: true, message: 'Повторите пароль' },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('password') === value) {
									return Promise.resolve()
								}
								return Promise.reject(new Error('Пароли не совпадают'))
							},
						}),
					]}
				>
					<Password prefix={<PasswordIcon />} size='large' placeholder='Повторите пароль' />
				</Form.Item>

				<Form.Item
					name='termsAccepted'
					valuePropName='checked'
					rules={[
						{
							validator: (_, value) =>
								value
									? Promise.resolve()
									: Promise.reject(new Error('Необходимо принять условия')),
						},
					]}
				>
					<Checkbox>Принимаю условия обработки персональных данных</Checkbox>
				</Form.Item>

				<Form.Item>
					<Button
						className='register-submit'
						type='primary'
						htmlType='submit'
						size='large'
						block
						disabled={disabledButton}
						loading={isRegisterLoading}
					>
						{hasError ? 'Неверные данные' : 'Создать аккаунт'}
					</Button>
				</Form.Item>
			</Form>
		</AuthFormWrapper>
	)
}

export default RegisterPage
