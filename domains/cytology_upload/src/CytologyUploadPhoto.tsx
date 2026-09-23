'use client'

import * as React from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Upload, message } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import type { ChunkedUploadCompleteMeta } from '@medml/shared'
import { CYTOLOGY_UPLOAD_MAX_SIZE_GB, cytologyChunkUploadConfig } from '@medml/cytology-upload'
import { ConfigurableSplitUpload, accentButtonTheme, type UploadSchemaField } from '@medml/ui'

import { cytologyLocalizations, cytologyMarkings } from './constants'
import { formatCytologyUploadError, resolveCytologyCreateId } from './mapUploadValues'

const { Dragger } = Upload

export type CytologyPatientOption = {
	value: string
	label: string
}

export type CytologyUploadPhotoProps = {
	presetPatientCardId?: string
	patientOptions: CytologyPatientOption[]
	patientsLoading?: boolean
	isSubmitting?: boolean
	/** Создание исследования по уже собранному на сервере файлу (без повторной загрузки из браузера). */
	onCreate: (params: {
		values: Record<string, unknown>
		uploadedFileMeta: ChunkedUploadCompleteMeta
	}) => Promise<{ id?: string | number; image_id?: string | number; pk?: string | number }>
	onSuccess: (id: string | number) => void
	formFooterSlot?: React.ReactNode
}

export function CytologyUploadPhoto({
	presetPatientCardId = '',
	patientOptions,
	patientsLoading = false,
	isSubmitting = false,
	onCreate,
	onSuccess,
	formFooterSlot,
}: CytologyUploadPhotoProps) {
	const [file, setFile] = React.useState<File | null>(null)

	const fields = React.useMemo<UploadSchemaField[]>(
		() => [
			{
				name: 'marking',
				label: 'Доп. маркировка',
				type: 'select',
				required: true,
				options: Object.entries(cytologyMarkings).map(([value, label]) => ({ value, label })),
			},
			{ name: 'number', label: 'Номер исследования', type: 'input', required: true },
			{
				name: 'localization',
				label: 'Локализация',
				type: 'select',
				required: true,
				options: Object.entries(cytologyLocalizations).map(([value, label]) => ({ value, label })),
			},
			{ name: 'calcitonin', label: 'Кальцитонин', type: 'input', required: true },
			{ name: 'thyroglobulin', label: 'Тиреоглобулин в смыве', type: 'input', required: true },
			{ name: 'calcInSense', label: 'Кальцитонин в смыве', type: 'input', required: true },
			{
				name: 'patientCard',
				label: 'Карта пациента',
				type: 'select',
				required: true,
				options: patientOptions,
				disabled: patientsLoading && patientOptions.length === 0,
			},
		],
		[patientOptions, patientsLoading],
	)

	const uploadProps: UploadProps = React.useMemo(
		() => ({
			name: 'file',
			multiple: false,
			accept: '.svs',
			maxCount: 1,
			beforeUpload: next => {
				const maxSize = CYTOLOGY_UPLOAD_MAX_SIZE_GB * 1024 * 1024 * 1024
				if (next.size > maxSize) {
					message.error(`Файл должен быть меньше ${CYTOLOGY_UPLOAD_MAX_SIZE_GB} ГБ`)
					return Upload.LIST_IGNORE
				}
				setFile(next as File)
				return false
			},
			onRemove: () => setFile(null),
			fileList: file
				? ([{ uid: 'cyto-file', name: file.name, status: 'done', originFileObj: file }] as UploadFile[])
				: [],
		}),
		[file],
	)

	const onSubmit = async ({
		values,
		uploadedFileMeta,
	}: {
		values: Record<string, unknown>
		uploadedFileMeta?: unknown
	}) => {
		if (!file) {
			message.error('Выберите файл формата .svs')
			return
		}
		if (!uploadedFileMeta) {
			message.error('Сначала завершите чанковую загрузку файла')
			return
		}

		try {
			const result = await onCreate({
				values,
				uploadedFileMeta: uploadedFileMeta as ChunkedUploadCompleteMeta,
			})
			const nextId = resolveCytologyCreateId(result)
			if (nextId == null) {
				throw new Error('No cytology id in response')
			}
			message.success('Снимок отправлен на диагностику')
			onSuccess(nextId)
		} catch (error) {
			message.error(formatCytologyUploadError(error))
		}
	}

	return (
		<ConfigProvider theme={accentButtonTheme}>
			<ConfigurableSplitUpload
				key={presetPatientCardId || 'cyto-upload'}
				fields={fields}
				initialValues={presetPatientCardId ? { patientCard: presetPatientCardId } : undefined}
				file={file}
				requireFile
				chunked={cytologyChunkUploadConfig}
				onSubmit={onSubmit}
				submitText='Начать диагностику'
				actionsPlacement='upload-column'
				uploadSlot={
					<Dragger className='upload-page__dropzone' {...uploadProps} disabled={isSubmitting}>
						<p className='ant-upload-drag-icon'>
							<InboxOutlined />
						</p>
						<p className='ant-upload-text'>Перетащите файл или нажмите для выбора</p>
						<p className='ant-upload-hint'>Формат .svs, до {CYTOLOGY_UPLOAD_MAX_SIZE_GB} ГБ (чанки по 20 МБ)</p>
					</Dragger>
				}
				formFooterSlot={formFooterSlot}
				extraActions={
					<Upload {...uploadProps} showUploadList={false}>
						<Button htmlType='button' disabled={isSubmitting}>
							Добавить файл
						</Button>
					</Upload>
				}
			/>
		</ConfigProvider>
	)
}
