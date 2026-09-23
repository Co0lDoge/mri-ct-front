import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Space, Table, Typography, message } from 'antd'

import dayjs from 'dayjs'

import { PatientProfileView } from '@medml/patient_view'
import { PageShell } from '@medml/layout'
import {
	PatientEditModal,
	stripPolicyDigits,
	type PatientCreateValuesUzi,
} from '@medml/patient_create'

import { useUpdateUziPatientWithCardMutation } from '@/api/patientsApi'

import {
	useGetMedPatientByIdQuery,
	useGetMedPatientCardQuery,
	useGetPatientUziStudiesQuery,
	type PatientUziStudyRow,
} from '@/api/patientProfileApi'
import { useGetUziDevicesQuery } from '@/api/uziApi'
import { useDoctorId } from '@/api/hooks/useDoctorId'
import { useUziStudyColumns } from './patientProfile/uziStudyColumns'

// Карточка: радиус, тень и бордер приходят из темы antd (токены дизайн-системы).
const cardStyle: React.CSSProperties = { width: '100%' }

/** Загрузка карточки пациента и его снимков + состояние пагинации таблицы. */
function usePatientProfileData(patientId: string) {
	const { doctorId, status } = useDoctorId()
	const authed = status === 'authenticated'

	const [uziPage, setUziPage] = React.useState(1)
	const [uziPageSize, setUziPageSize] = React.useState(10)

	React.useEffect(() => {
		setUziPage(1)
	}, [patientId])

	const { data: devices = [] } = useGetUziDevicesQuery(undefined, { skip: !authed })

	const deviceMap = React.useMemo(
		() => new Map(devices.map(d => [String(d.id), d.name])),
		[devices],
	)

	const {
		data: patientApi,
		isLoading: patientLoading,
		isError: patientError,
	} = useGetMedPatientByIdQuery(patientId, { skip: !patientId || !authed })

	const { data: cardApi } = useGetMedPatientCardQuery(
		{ doctorId, patientId },
		{ skip: !doctorId || !patientId || !authed },
	)

	const { data: uziRows = [], isFetching: uziLoading } = useGetPatientUziStudiesQuery(
		patientId,
		{ skip: !patientId || !authed },
	)

	const patient = React.useMemo(() => {
		if (!patientApi) return null
		return {
			...patientApi,
			diagnosis: cardApi?.diagnosis ?? patientApi.diagnosis ?? '',
		}
	}, [patientApi, cardApi])

	const uziPagination = React.useMemo(
		() => ({
			current: uziPage,
			pageSize: uziPageSize,
			total: uziRows.length,
			showSizeChanger: true,
			pageSizeOptions: [10, 20, 50],
			showTotal: (total: number, range: [number, number]) =>
				total <= 0 ? '0 снимков' : `${range[0]}–${range[1]} из ${total} снимков`,
			onChange: (page: number, size?: number) => {
				const nextSize = size ?? uziPageSize
				if (nextSize !== uziPageSize) {
					setUziPageSize(nextSize)
					setUziPage(1)
				} else {
					setUziPage(page)
				}
			},
		}),
		[uziPage, uziPageSize, uziRows.length],
	)

	return {
		patient,
		// id карточки нужен для редактирования (PUT /patient/update/{cardId}/)
		cardId: cardApi?.cardId ?? null,
		patientError,
		patientLoading,
		loading: (authed && !doctorId) || patientLoading,
		deviceMap,
		uziRows,
		uziLoading,
		uziPagination,
	}
}

export default function PatientProfileRoute() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const patientId = searchParams.get('id')?.trim() ?? ''

	const {
		patient,
		cardId,
		patientError,
		patientLoading,
		loading,
		deviceMap,
		uziRows,
		uziLoading,
		uziPagination,
	} = usePatientProfileData(patientId)

	const [editOpen, setEditOpen] = React.useState(false)
	const [updatePatient, { isLoading: isSaving }] =
		useUpdateUziPatientWithCardMutation()

	const handleEditFinish = async (values: PatientCreateValuesUzi) => {
		if (!cardId) {
			message.error('Не удалось определить карту пациента')
			return
		}
		try {
			await updatePatient({
				cardId,
				patientId,
				surname: values.surname.trim(),
				name: values.name.trim(),
				patronymic: values.patronymic.trim(),
				email: values.email.trim(),
				policy: stripPolicyDigits(values.policy),
				birth_date: dayjs(values.birthDate).format('YYYY-MM-DD'),
				active: values.active,
				malignancy: values.malignancy,
				diagnosis: values.diagnosis.trim(),
			}).unwrap()
			message.success('Данные пациента обновлены')
			setEditOpen(false)
		} catch (error: any) {
			console.error('Error updating patient:', error)
			message.error(error?.data?.detail || 'Не удалось сохранить изменения')
		}
	}

	const uziColumns = useUziStudyColumns(deviceMap)

	const renderBody = () => {
		if (!patientId) {
			return (
				<Typography.Text type='danger'>
					Не указан идентификатор пациента (?id=)
				</Typography.Text>
			)
		}

		if (patientError && !patientLoading) {
			return (
				<Typography.Text type='danger'>
					Не удалось загрузить данные пациента. Проверьте, что бэкенд запущен и вы
					авторизованы.
				</Typography.Text>
			)
		}

		return (
			<PatientProfileView
				patient={patient}
				loading={loading}
				onBack={() => navigate('/patients')}
				backLabel='Пациенты'
				actions={
					<Button onClick={() => setEditOpen(true)} disabled={!cardId}>
						Редактировать
					</Button>
				}
			>
				<Space direction='vertical' size={16} style={{ width: '100%' }}>
					<Card
						styles={{ body: { padding: '16px 24px 24px' } }}
						title='Снимки'
						style={cardStyle}
						extra={
							<Button
								type='primary'
								disabled={!patientId}
								onClick={() =>
									navigate(`/upload_photo?patientId=${encodeURIComponent(patientId)}`)
								}
							>
								Добавить
							</Button>
						}
					>
						<Table<PatientUziStudyRow>
							rowKey='key'
							size='middle'
							tableLayout='fixed'
							style={{ width: '100%' }}
							columns={uziColumns}
							dataSource={uziRows}
							loading={uziLoading}
							pagination={uziPagination}
							locale={{ emptyText: 'Нет снимков' }}
							// Шесть колонок не помещаются на планшете и телефоне —
							// уводим в горизонтальный скролл вместо распирания страницы.
							scroll={{ x: 720 }}
						/>
					</Card>
				</Space>
			</PatientProfileView>
		)
	}

	return (
		<PageShell>
			{renderBody()}

			<PatientEditModal
				open={editOpen}
				variant='uzi'
				patient={patient}
				confirmLoading={isSaving}
				onCancel={() => setEditOpen(false)}
				onFinish={vals => void handleEditFinish(vals as PatientCreateValuesUzi)}
			/>
		</PageShell>
	)
}
