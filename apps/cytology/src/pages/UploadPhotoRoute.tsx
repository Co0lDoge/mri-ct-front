import '@medml/ui/styles/upload-page.scss'

import * as React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { CytologyUploadPhoto, mapUploadValuesToCytologyStagedBody } from '@medml/cytology_upload'
import { PageShell } from '@medml/layout'
import { PatientCreateModal, type PatientCreateValuesCytology } from '@medml/patient_create'
import { useLazyGetMedCardQuery } from '@medml/patients'

import { isGoBackend } from '@/lib/apiBackend'
import { useCreateCytologyFromStagedMutation } from '@/lib/cytologyApi'
import { useCreateCytologyPatient } from '@/lib/useCreateCytologyPatient'
import { useCytologyPatients } from '@/lib/useCytologyPatients'
import { useDoctorId } from '@/lib/useDoctorId'

export default function UploadPhotoRoute() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const presetPatientCardId = searchParams.get('patientId')?.trim() ?? ''
	const { doctorId, status } = useDoctorId()

	const [createModalOpen, setCreateModalOpen] = React.useState(false)

	const { cards, isFetching } = useCytologyPatients({
		doctorId,
		enabled: status === 'authenticated',
	})

	const [createCytologyFromStaged, { isLoading }] = useCreateCytologyFromStagedMutation()
	const { createPatient, isCreating } = useCreateCytologyPatient(doctorId)
	const [fetchMedCard] = useLazyGetMedCardQuery()

	const resolvePatientCard = async (selected: string): Promise<string> => {
		if (!isGoBackend()) return selected

		const card = await fetchMedCard({ doctorId, patientId: selected }).unwrap()
		if (card.uuid) return card.uuid

		throw new Error('Проверьте, что карта у этого пациента вообще заведена.')
	}

	const patientOptions = cards.map(card => ({
		value: card.cardId,
		label: `${card.fullName}${card.policyNumber ? ` — ${card.policyNumber}` : ''}`,
	}))

	const handleCreatePatient = async (values: PatientCreateValuesCytology) => {
		if (await createPatient(values)) {
			setCreateModalOpen(false)
		}
	}

	return (
		<PageShell
			className='upload-page'
			eyebrow='ИИ ассистент'
			title='Новый снимок цитологии'
			subtitle='Заполните параметры исследования и загрузите изображение для AI-анализа.'
		>
			<Card>
				<CytologyUploadPhoto
					presetPatientCardId={presetPatientCardId}
					patientOptions={patientOptions}
					patientsLoading={isFetching}
					isSubmitting={isLoading}
					onCreate={async ({ values, uploadedFileMeta }) => {
						const body = mapUploadValuesToCytologyStagedBody(values, uploadedFileMeta)
						const patientCard = await resolvePatientCard(body.patient_card)
						return createCytologyFromStaged({ ...body, patient_card: patientCard }).unwrap()
					}}
					onSuccess={id => navigate(`/diagnostic_is_running/${encodeURIComponent(String(id))}`)}
					formFooterSlot={
						<Button
							className='upload-page__add-patient'
							icon={<PlusOutlined />}
							onClick={() => setCreateModalOpen(true)}
							disabled={isLoading}
						>
							Добавить нового пациента
						</Button>
					}
				/>
			</Card>

			<PatientCreateModal
				open={createModalOpen}
				variant='cytology'
				onCancel={() => setCreateModalOpen(false)}
				onFinish={vals => void handleCreatePatient(vals as PatientCreateValuesCytology)}
				confirmLoading={isCreating}
			/>
		</PageShell>
	)
}
