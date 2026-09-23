'use client'

import * as React from 'react'
import { Button, Form, Modal, Space } from 'antd'
import type { FormProps } from 'antd'

import { PatientCreateFormFields } from './PatientCreateFormFields'
import type { PatientCreateVariant } from './types'

export type PatientCreateModalProps = {
	open: boolean
	title?: string
	variant: PatientCreateVariant
	confirmLoading?: boolean
	onCancel: () => void
	/** Вызывается после успешной валидации формы; отправка API — в родителе */
	onFinish: FormProps['onFinish']
	/** Предзаполнение (режим редактирования карты) */
	initialValues?: FormProps['initialValues']
	okText?: string
	cancelText?: string
	width?: number
}

export function PatientCreateModal({
	open,
	title = 'Создание карты',
	variant,
	confirmLoading,
	onCancel,
	onFinish,
	initialValues,
	okText = 'Создать',
	cancelText = 'Отменить',
	width = 600,
}: PatientCreateModalProps) {
	const [form] = Form.useForm()

	React.useEffect(() => {
		if (!open) return

		form.resetFields()
		if (initialValues) {
			form.setFieldsValue(initialValues)
		}
	}, [open, form, initialValues])

	return (
		<Modal title={title} open={open} onCancel={onCancel} footer={null} width={width} destroyOnHidden>
			<Form form={form} layout='vertical' onFinish={onFinish} style={{ marginTop: 8 }}>
				<PatientCreateFormFields variant={variant} />
				<Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
					<Button onClick={onCancel}>{cancelText}</Button>
					<Button type='primary' htmlType='submit' loading={confirmLoading}>
						{okText}
					</Button>
				</Space>
			</Form>
		</Modal>
	)
}
