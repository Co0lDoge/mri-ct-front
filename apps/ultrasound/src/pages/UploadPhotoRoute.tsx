import '@medml/ui/styles/upload-page.scss'

import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { InboxOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, ConfigProvider, Form, Space, Upload, message } from 'antd'
import dayjs from 'dayjs'

import { ConfigurableSplitUpload, accentButtonTheme } from '@medml/ui'
import { PageShell } from '@medml/layout'
import {
	PatientCreateModal,
	buildFullNameUzi,
	stripPolicyDigits,
	type PatientCreateValuesUzi,
} from '@medml/patient_create'

import { isThyroidBackend } from '@/lib/apiBackend'
import {
	useCreateMedPatientCardMutation,
	useCreateMedPatientMutation,
	useCreateUziPatientWithCardMutation,
} from '@/api/patientsApi'
import { useDoctorId } from '@/api/hooks/useDoctorId'
import { useUziUpload } from './useUziUpload'

const { Dragger } = Upload

export default function UploadPhotoRoute() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const presetPatientId = searchParams.get('patientId')?.trim() ?? ''
	const [form] = Form.useForm<Record<string, unknown>>()

	const { doctorId } = useDoctorId()
	const [createModalOpen, setCreateModalOpen] = React.useState(false)

	const [createThyroidPatient, { isLoading: isCreatingThyroid }] = useCreateUziPatientWithCardMutation()
	const [createMedPatient, { isLoading: isCreatingMedPatient }] = useCreateMedPatientMutation()
	const [createMedCard, { isLoading: isCreatingMedCard }] = useCreateMedPatientCardMutation()

	const isCreatingPatient = isThyroidBackend() ? isCreatingThyroid : isCreatingMedPatient || isCreatingMedCard

	const projection = Form.useWatch('projection', form)

	const { fields, file, uploadProps, initialValues, handleSubmit, pageBusy, isUploading } = useUziUpload({
		presetPatientId,
		projection: typeof projection === 'string' ? projection : undefined,
		onUploaded: () => navigate('/patients'),
	})

	const handleCreatePatient = async (values: PatientCreateValuesUzi) => {
		if (!doctorId) {
			message.warning('Не удалось определить врача')
			return
		}

		const birth_date = dayjs(values.birthDate).format('YYYY-MM-DD')
		const policy = stripPolicyDigits(values.policy)

		if (isThyroidBackend()) {
			const created = await createThyroidPatient({
				doctorId,
				surname: values.surname.trim(),
				name: values.name.trim(),
				patronymic: values.patronymic.trim(),
				email: values.email.trim(),
				policy,
				active: values.active,
				malignancy: values.malignancy,
				birth_date,
				diagnosis: values.diagnosis.trim(),
			}).unwrap()

			if (!created.id) {
				message.error('Сервер не вернул идентификатор пациента')
				return
			}
		} else {
			const created = await createMedPatient({
				email: values.email.trim(),
				fullname: buildFullNameUzi(values),
				policy,
				active: values.active,
				malignancy: values.malignancy,
				birth_date,
			}).unwrap()

			const patientId = typeof created === 'object' && created?.id ? String(created.id) : ''
			if (!patientId) {
				message.error('Сервер не вернул идентификатор пациента')
				return
			}

			await createMedCard({
				patient_id: patientId,
				doctor_id: doctorId,
				diagnosis: values.diagnosis.trim(),
			}).unwrap()
		}

		message.success('Пациент создан')
		setCreateModalOpen(false)
	}

	return (
		<PageShell
			className='upload-page'
			eyebrow='ИИ ассистент'
			title='Новый снимок УЗИ'
			subtitle='Заполните параметры исследования и загрузите изображение для AI-анализа.'
		>
			<Card>
				<Space direction='vertical' size={20} style={{ width: '100%' }}>
					<ConfigProvider theme={accentButtonTheme}>
						<ConfigurableSplitUpload
							key={presetPatientId || 'upload-default'}
							form={form}
							fields={fields}
							initialValues={initialValues}
							file={file}
							requireFile
							onSubmit={handleSubmit}
							submitText='Провести диагностику'
							actionsPlacement='upload-column'
							uploadSlot={
								<Dragger className='upload-page__dropzone' {...uploadProps} disabled={pageBusy || isUploading}>
									<p className='ant-upload-drag-icon'>
										<InboxOutlined />
									</p>
									<p className='ant-upload-text'>Перетащите файл или нажмите для выбора</p>
									<p className='ant-upload-hint'>DICOM · TIF · JPG · PNG до 50 МБ</p>
								</Dragger>
							}
							formFooterSlot={
								<Button
									className='upload-page__add-patient'
									icon={<PlusOutlined />}
									onClick={() => setCreateModalOpen(true)}
									disabled={pageBusy}
								>
									Добавить нового пациента
								</Button>
							}
							extraActions={
								<Upload {...uploadProps} showUploadList={false}>
									<Button htmlType='button' disabled={pageBusy || isUploading}>
										Добавить файл
									</Button>
								</Upload>
							}
						/>
					</ConfigProvider>
				</Space>
			</Card>

			<PatientCreateModal
				open={createModalOpen}
				variant='uzi'
				onCancel={() => setCreateModalOpen(false)}
				onFinish={vals => void handleCreatePatient(vals as PatientCreateValuesUzi)}
				confirmLoading={isCreatingPatient}
			/>
		</PageShell>
	)
}
