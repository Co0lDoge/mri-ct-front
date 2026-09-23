import * as React from 'react'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'

import { PatientCreateModal, type PatientCreateValuesCytology } from '@medml/patient_create'
import { PatientsPage, type PatientListSort } from '@medml/patient_list'
import { PageShell } from '@medml/layout'
import { DoctorProfileCard } from '@medml/doctor_profile'
import { filterMedPatientRows, sortMedPatientRows } from '@medml/patients'

import { useCreateCytologyPatient } from '@/lib/useCreateCytologyPatient'
import { useCytologyPatients } from '@/lib/useCytologyPatients'
import { useDoctorId } from '@/lib/useDoctorId'

export default function PatientsRoute() {
	const navigate = useNavigate()
	const { doctorId, status } = useDoctorId()
	const [createModalOpen, setCreateModalOpen] = React.useState(false)

	const [search, setSearch] = React.useState('')
	const [sort, setSort] = React.useState<PatientListSort>({ key: null, order: null })

	// Источник списка зависит от бэкенда — см. `useCytologyPatients`.
	const {
		rows: allRows,
		cards,
		doctorProfile,
		isFetching,
	} = useCytologyPatients({
		doctorId,
		enabled: status === 'authenticated',
	})

	const rows = React.useMemo(
		() => sortMedPatientRows(filterMedPatientRows(allRows, search), sort.key, sort.order),
		[allRows, search, sort.key, sort.order],
	)

	const { createPatient, isCreating } = useCreateCytologyPatient(doctorId)

	const handleCreateFinish = async (values: PatientCreateValuesCytology) => {
		if (await createPatient(values)) {
			setCreateModalOpen(false)
		}
	}

	return (
		<PageShell
			eyebrow='Врачебный кабинет'
			title='Пациенты'
			subtitle='Карты пациентов, снимки цитологии и результаты диагностики.'
		>
			<DoctorProfileCard profile={doctorProfile} loading={isFetching && !doctorProfile} showNotifications={false} />

			<PatientsPage
				title='Мои пациенты'
				rows={rows}
				total={rows.length}
				isLoading={(status === 'authenticated' && !doctorId) || isFetching}
				searchValue={search}
				onSearchChange={setSearch}
				onSearchSubmit={setSearch}
				sort={sort}
				onSortChange={setSort}
				onAddPatient={() => setCreateModalOpen(true)}
				onOpenPatientCard={id => {
					// Go-ручка снимков принимает id пациента, Django — id карты.
					// Кладём в ссылку оба, чтобы страница работала на любом бэкенде.
					const cardId = String(id)
					const patientId = cards.find(item => item.cardId === cardId)?.patientId
					const query = new URLSearchParams({ id: cardId })
					if (patientId) query.set('patient', patientId)
					navigate(`/patient_profile?${query.toString()}`)
				}}
				onDeletePatient={id => message.info(`Удаление карты ${String(id)} оставлено как placeholder для parity.`)}
			/>
			<PatientCreateModal
				open={createModalOpen}
				variant='cytology'
				onCancel={() => setCreateModalOpen(false)}
				onFinish={vals => void handleCreateFinish(vals as PatientCreateValuesCytology)}
				confirmLoading={isCreating}
			/>
		</PageShell>
	)
}
