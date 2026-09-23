import type { PatientRow } from '@medml/patient_list'
import type { DoctorProfileViewModel } from '@medml/doctor_profile'
import { useGetMedDoctorPatientsQuery, useGetMedDoctorQuery } from '@medml/patients'

import { isGoBackend } from './apiBackend'
import { useGetMedWorkerPatientsQuery, type CytologyPatientCard } from './patientsApi'

export type CytologyPatientsData = {
	rows: PatientRow[]
	cards: CytologyPatientCard[]
	doctorProfile: DoctorProfileViewModel | null
	isFetching: boolean
}

/**
 * Список пациентов врача и его профиль — из того бэкенда, который включён.
 *
 * Источники разные во всём:
 *
 * * **Django** — одна ручка `/med_worker/patients/{id}`, которая возвращает
 *   карты пациентов вместе с блоком `med_worker`. Профиль врача берётся
 *   оттуда же, отдельного запроса не нужно.
 * * **Go** — две ручки: `/med/doctor/{id}/patients` для списка и
 *   `/med/doctor/{id}` для профиля. Карт пациентов там нет вовсе: список
 *   отдаёт самих пациентов, поэтому `cards` собираем из строк.
 *
 * Оба хука вызываются всегда, лишний просто пропускается
 * через `skip`.
 */
export function useCytologyPatients(params: { doctorId: string; enabled: boolean }): CytologyPatientsData {
	const { doctorId, enabled } = params

	const go = isGoBackend()
	const skipDjango = !enabled || !doctorId || go
	const skipGo = !enabled || !doctorId || !go

	const django = useGetMedWorkerPatientsQuery({ doctorId }, { skip: skipDjango })
	const goPatients = useGetMedDoctorPatientsQuery({ doctorId }, { skip: skipGo })
	const goDoctor = useGetMedDoctorQuery(doctorId, { skip: skipGo })

	if (!go) {
		return {
			rows: django.data?.rows ?? [],
			cards: django.data?.cards ?? [],
			doctorProfile: django.data?.doctorProfile ?? null,
			isFetching: django.isFetching,
		}
	}

	const rows = goPatients.data?.rows ?? []

	// В med-сервисе карты пациента как отдельной сущности в списке нет:
	// строка — это сам пациент. Поэтому оба идентификатора совпадают.
	const cards: CytologyPatientCard[] = rows.map(row => ({
		cardId: String(row.id),
		patientId: String(row.id),
		fullName: row.fullName,
		email: row.email,
		policyNumber: row.policyNumber,
		diagnosis: row.diagnosisLabel,
		active: row.statusLabel === 'Активен',
		birthDate: row.birthDate,
	}))

	return {
		rows,
		cards,
		doctorProfile: goDoctor.data ?? null,
		isFetching: goPatients.isFetching || goDoctor.isFetching,
	}
}
