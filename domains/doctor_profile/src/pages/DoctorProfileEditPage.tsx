'use client'

import * as React from 'react'
import { Button, Card, Checkbox, Col, Form, Input, Row, Skeleton } from 'antd'

import type { DoctorProfileFormValues, DoctorProfileViewModel } from '../types'

export type DoctorProfileEditPageProps = {
	profile?: DoctorProfileViewModel | null
	loading?: boolean
	saving?: boolean
	onSubmit: (values: DoctorProfileFormValues) => void | Promise<void>
	className?: string
}

export function DoctorProfileEditPage({ profile, loading, saving, onSubmit, className }: DoctorProfileEditPageProps) {
	const [form] = Form.useForm<DoctorProfileFormValues>()

	React.useEffect(() => {
		if (!profile) return
		form.setFieldsValue({
			lastName: profile.lastName,
			firstName: profile.firstName,
			fathersName: profile.fathersName,
			job: profile.speciality ?? '',
			medOrganization: profile.organization ?? '',
			isRemoteWorker: profile.isRemoteWorker,
			expertDetails: profile.expertDetails,
		})
	}, [profile, form])

	if (loading || !profile) {
		return (
			<Card className={className}>
				<Skeleton active avatar paragraph={{ rows: 6 }} />
			</Card>
		)
	}

	return (
		<Form className={className} form={form} layout='vertical' onFinish={onSubmit}>
			<Row gutter={[24, 24]} align='top'>
				<Col xs={24} lg={12}>
					<Card title='Профиль'>
						<Row gutter={16}>
							<Col xs={24} sm={12}>
								<Form.Item label='Фамилия' name='lastName' rules={[{ required: true, message: 'Введите фамилию' }]}>
									<Input placeholder='Иванов' />
								</Form.Item>
							</Col>
							<Col xs={24} sm={12}>
								<Form.Item label='Имя' name='firstName' rules={[{ required: true, message: 'Введите имя' }]}>
									<Input placeholder='Пётр' />
								</Form.Item>
							</Col>
						</Row>

						<Form.Item label='Отчество' name='fathersName' rules={[{ required: true, message: 'Введите отчество' }]}>
							<Input placeholder='Сергеевич' />
						</Form.Item>

						<Form.Item label='Должность' name='job'>
							<Input placeholder='Эндокринолог' />
						</Form.Item>

						<Form.Item
							label='Место работы'
							name='medOrganization'
							rules={[{ required: true, message: 'Укажите организацию' }]}
						>
							<Input placeholder='Клиника №1, Москва' />
						</Form.Item>

						<Form.Item name='isRemoteWorker' valuePropName='checked' style={{ marginBottom: 0 }}>
							<Checkbox>Я хочу давать экспертное заключение</Checkbox>
						</Form.Item>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card title='Профессиональный опыт'>
						<Form.Item label='Опыт и сертификаты' name='expertDetails'>
							<Input.TextArea rows={10} placeholder='Стаж, специализация, сертификаты, публикации.' />
						</Form.Item>

						<Button type='primary' htmlType='submit' loading={saving} block>
							Сохранить изменения
						</Button>
					</Card>
				</Col>
			</Row>
		</Form>
	)
}
