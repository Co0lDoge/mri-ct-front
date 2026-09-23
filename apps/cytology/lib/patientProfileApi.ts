import dayjs from 'dayjs'

import { formatApiDateToDisplay } from '@medml/shared'
import { baseApi } from '@medml/store'
import { formatPolicySpaced16, type PatientCreateValuesCytology } from '@medml/patient_create'
import type { PatientProfileViewModel } from '@medml/patient_view'

import { cytologyRoutes } from './cytologyRoutes'
import type { AddPatientPayload } from './patientsApi'

/**
 * Идентификаторы пациента для запроса снимков.
 *
 * Django-ручка `/patient/shots/{id}` принимает id карты, Go-ручка
 * `/cytology/patient/{patient_id}/shots` — id самого пациента. Поэтому
 * страница передаёт оба, а выбор делает `cytologyRoutes.patientShots`.
 */
export type PatientShotsArgs = {
	cardId: string
	patientId?: string
}

export type CytologyStudyRow = {
	id: string
	numberLabel: string
	materialTypeLabel: string
	bethesdaLabel: string
	cytologyDateLabel: string
	cytologyDateSort: number
}

type CytologyShotDto = {
	id: number | string | null
	diagnos_date?: string
	diagnostic_marking?: string
	diagnostic_number?: string | number
	material_type?: string
	details?: {
		probs?: number[]
	}
}

type CytologyPatientDto = {
	id: number | string
	first_name: string
	last_name: string
	fathers_name?: string
	birth_date?: string
	email?: string
	personal_policy?: string
	is_active?: boolean
}

type CytologyPatientShotsEnvelope = {
	results?: {
		patient?: CytologyPatientDto
		shots?: CytologyShotDto[]
		diagnosis?: string
	}
}

type CytologyPatientShotsDirect = {
	patient?: CytologyPatientDto
	shots?: CytologyShotDto[]
	diagnosis?: string
	card?: { diagnosis?: string }
}

type CytologyPatientShotsResponse = CytologyPatientShotsDirect | CytologyPatientShotsEnvelope

export type PatientEditDefaults = Omit<PatientCreateValuesCytology, 'birthDate'> & {
	birthDate: string
}

export type PatientProfileData = {
	patient: PatientProfileViewModel | null
	studies: CytologyStudyRow[]
	editDefaults: PatientEditDefaults | null
}

const materialTypeLabels: Record<string, string> = {
	GS: 'Генитальный мазок',
	TP: 'Щитовидная железа',
	BP: 'Молочная железа',
	PTP: 'Околощитовидная железа',
	LNP: 'Лимфатический узел',
}

const bethesdaByIndex = ['Bethesda I', 'Bethesda II', 'Bethesda III', 'Bethesda IV', 'Bethesda V', 'Bethesda VI']

const metastasisLabels = ['Неинформативно', 'Отсутствие метастаза', 'Метастаз']

function maxProbIndex(probs: number[]): number {
	let max = -1
	let index = -1
	probs.forEach((value, i) => {
		if (value > max) {
			max = value
			index = i
		}
	})
	return index
}

function bethesdaLabelByProbs(probs: number[] | undefined, marking?: string): string {
	if (!Array.isArray(probs) || probs.length === 0) return '—'
	const index = maxProbIndex(probs)
	if (index < 0) return '—'

	const isPuncture = (marking ?? '').trim().charAt(0).toUpperCase() === 'П'
	if (isPuncture) {
		return bethesdaByIndex[index] ?? '—'
	}

	const metastasisIndex = index + 1
	return metastasisLabels[metastasisIndex] ?? metastasisLabels[metastasisLabels.length - 1] ?? '—'
}

function extractPatientShots(response: CytologyPatientShotsResponse): {
	patient?: CytologyPatientDto
	shots: CytologyShotDto[]
	diagnosis: string
} {
	if ('results' in response && response.results) {
		return {
			patient: response.results.patient,
			shots: response.results.shots ?? [],
			diagnosis: response.results.diagnosis ?? '',
		}
	}

	const direct = response as CytologyPatientShotsDirect
	return {
		patient: direct.patient,
		shots: direct.shots ?? [],
		diagnosis: direct.diagnosis ?? direct.card?.diagnosis ?? '',
	}
}

function mapPatient(patient: CytologyPatientDto | undefined, diagnosis: string): PatientProfileViewModel | null {
	if (!patient) return null
	const fullName = [patient.last_name, patient.first_name, patient.fathers_name].filter(Boolean).join(' ').trim()
	const policyDigits = patient.personal_policy?.replace(/\D/g, '') ?? ''
	return {
		id: String(patient.id),
		fullName,
		email: patient.email ?? '',
		policyNumber: policyDigits ? formatPolicySpaced16(policyDigits) : '',
		birthDate: formatApiDateToDisplay(patient.birth_date),
		active: Boolean(patient.is_active),
		diagnosis: diagnosis.trim() || 'Не обнаружено',
	}
}

function mapEditDefaults(patient: CytologyPatientDto | undefined, diagnosis: string): PatientEditDefaults | null {
	if (!patient) return null
	const policyDigits = patient.personal_policy?.replace(/\D/g, '') ?? ''
	return {
		lastName: patient.last_name ?? '',
		firstName: patient.first_name ?? '',
		fathersName: patient.fathers_name ?? '',
		personalPolicy: policyDigits ? formatPolicySpaced16(policyDigits) : '',
		email: patient.email ?? '',
		birthDate: patient.birth_date ?? '',
		diagnosis: diagnosis.trim(),
		active: Boolean(patient.is_active),
	}
}

export const patientProfileApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getPatientShotsByCardId: builder.query<PatientProfileData, PatientShotsArgs>({
			query: ids => ({
				url: cytologyRoutes.patientShots(ids),
			}),
			transformResponse: (response: CytologyPatientShotsResponse): PatientProfileData => {
				const { patient: patientDto, shots, diagnosis } = extractPatientShots(response)
				const patient = mapPatient(patientDto, diagnosis)
				const studies: CytologyStudyRow[] = shots
					.filter((item): item is CytologyShotDto & { id: number | string } => item.id != null)
					.map(item => {
						const dateRaw = item.diagnos_date
						const parsed = dateRaw ? dayjs(dateRaw) : null
						return {
							id: String(item.id),
							numberLabel:
								item.diagnostic_marking && item.diagnostic_number != null
									? `${item.diagnostic_marking}-${item.diagnostic_number}`
									: '—',
							materialTypeLabel: materialTypeLabels[item.material_type ?? ''] ?? item.material_type ?? '—',
							bethesdaLabel: bethesdaLabelByProbs(item.details?.probs, item.diagnostic_marking),
							cytologyDateLabel: formatApiDateToDisplay(dateRaw) ?? '—',
							cytologyDateSort: parsed?.isValid() ? parsed.valueOf() : 0,
						}
					})

				return {
					patient,
					studies,
					editDefaults: mapEditDefaults(patientDto, diagnosis),
				}
			},
			providesTags: (_result, _error, ids) => [{ type: 'Patient', id: ids.cardId }],
		}),
		updatePatientCard: builder.mutation<void, { cardId: string; payload: AddPatientPayload }>({
			query: ({ cardId, payload }) => ({
				// Ручка med-сервиса; в Go-шлюзе полного аналога нет — см.
				// `goMissingEndpoints.patientCardUpdate`.
				url: `/patient/update/${encodeURIComponent(cardId)}/`,
				method: 'PATCH',
				body: payload,
			}),
			invalidatesTags: (_result, _error, { cardId }) => [
				{ type: 'Patient', id: cardId },
				{ type: 'Patient', id: 'LIST' },
			],
		}),
	}),
})

export const { useGetPatientShotsByCardIdQuery, useLazyGetPatientShotsByCardIdQuery, useUpdatePatientCardMutation } =
	patientProfileApi
