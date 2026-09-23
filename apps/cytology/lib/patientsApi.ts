import { createCacheBuster, formatApiDateToDisplay } from '@medml/shared'
import { baseApi } from '@medml/store'
import type { PatientListSortOrder, PatientRow } from '@medml/patient_list'
import type { DoctorProfileViewModel } from '@medml/doctor_profile'

type CytologyPatientDto = {
	id: string | number
	first_name: string
	last_name: string
	fathers_name?: string
	birth_date?: string
	email?: string
	personal_policy?: string
	is_active?: boolean
}

type CytologyCardDto = {
	id: string | number
	patient: CytologyPatientDto
	diagnosis?: string
}

type CytologyMedWorkerDto = {
	id: string | number
	first_name: string
	last_name: string
	fathers_name?: string
}

type GetMedWorkerPatientsEnvelope = {
	count?: number
	results?: {
		cards?: CytologyCardDto[]
		med_worker?: CytologyMedWorkerDto
	}
}

/** Ответ бэкенда: `{ cards, med_worker }` без пагинационной обёртки. */
type GetMedWorkerPatientsDirect = {
	cards?: CytologyCardDto[]
	med_worker?: CytologyMedWorkerDto
}

type GetMedWorkerPatientsApiResponse = CytologyPatientDto[] | GetMedWorkerPatientsDirect | GetMedWorkerPatientsEnvelope

function extractCardsAndMedWorker(response: GetMedWorkerPatientsApiResponse): {
	cards: CytologyCardDto[]
	medWorker?: CytologyMedWorkerDto
	count?: number
} {
	if (Array.isArray(response)) {
		return {
			cards: response.map(patient => ({
				id: String(patient.id ?? ''),
				patient,
				diagnosis: '',
			})),
		}
	}

	const shape = response as GetMedWorkerPatientsDirect & GetMedWorkerPatientsEnvelope

	if (Array.isArray(shape.cards)) {
		return {
			cards: shape.cards,
			medWorker: shape.med_worker,
		}
	}

	const envelope = shape.results
	return {
		cards: envelope?.cards ?? [],
		medWorker: envelope?.med_worker,
		count: shape.count,
	}
}

export type CytologyPatientCard = {
	cardId: string
	patientId: string
	fullName: string
	email?: string
	policyNumber?: string
	diagnosis?: string
	active: boolean
	birthDate?: string
}

export type GetMedWorkerPatientsResult = {
	rows: PatientRow[]
	cards: CytologyPatientCard[]
	total: number
	medWorkerName: string
	doctorProfile: DoctorProfileViewModel | null
}

type GetMedWorkerPatientsArgs = {
	doctorId: string
}

export type AddPatientPayload = {
	patient: {
		first_name: string
		last_name: string
		fathers_name: string
		personal_policy: string
		email: string
		birth_date: string
		is_active?: boolean
	}
	card: {
		diagnosis: string
	}
}

function normalizeName(item: CytologyPatientDto): string {
	const first = item.first_name?.trim() ?? ''
	const last = item.last_name?.trim() ?? ''
	const father = item.fathers_name?.trim() ?? ''
	return [last, first, father].filter(Boolean).join(' ').trim()
}

function normalizeMedWorkerName(item: CytologyMedWorkerDto | undefined): string {
	if (!item) return ''
	return [item.last_name, item.first_name, item.fathers_name].filter(Boolean).join(' ').trim()
}

/** Инициалы для аватара: первые буквы фамилии и имени. */
function buildInitials(item: CytologyMedWorkerDto): string {
	const first = item.first_name?.trim()?.[0] ?? ''
	const last = item.last_name?.trim()?.[0] ?? ''
	return `${last}${first}`.toUpperCase()
}

function mapMedWorkerToProfile(item: CytologyMedWorkerDto | undefined): DoctorProfileViewModel | null {
	if (!item) return null

	return {
		id: item.id,
		fullName: normalizeMedWorkerName(item),
		initials: buildInitials(item),
		lastName: item.last_name ?? '',
		firstName: item.first_name ?? '',
		fathersName: item.fathers_name ?? '',
		speciality: null,
		organization: null,
		isRemoteWorker: false,
		expertDetails: '',
	}
}

export function filterPatientRows(rows: PatientRow[], search?: string): PatientRow[] {
	const q = search?.trim().toLowerCase()
	if (!q) return rows

	return rows.filter(
		item =>
			item.fullName.toLowerCase().includes(q) ||
			String(item.policyNumber ?? '')
				.toLowerCase()
				.includes(q),
	)
}

export function sortPatientRows(
	rows: PatientRow[],
	sortKey?: keyof PatientRow | null,
	sortOrder?: PatientListSortOrder,
): PatientRow[] {
	if (!sortKey || !sortOrder) return rows

	const dir = sortOrder === 'descend' ? -1 : 1
	const sorted = [...rows]
	sorted.sort((a, b) => {
		const av = String(a[sortKey] ?? '')
		const bv = String(b[sortKey] ?? '')
		return av.localeCompare(bv, 'ru') * dir
	})
	return sorted
}

/**
 * Обход `cache_page(60)` у Django на списке пациентов врача.
 *
 * Без этого только что созданная карта не появляется в списке ещё минуту:
 * перезапрос уходит, но сервер отдаёт страницу из Redis. Ручка используется
 * только в Django-режиме — Go-шлюз ничего не кэширует.
 */
const patientsCache = createCacheBuster()

export const patientsApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		addPatient: builder.mutation<void, { medWorkerId: string; payload: AddPatientPayload }>({
			query: ({ medWorkerId, payload }) => ({
				url: `/patient/create/${encodeURIComponent(medWorkerId)}`,
				method: 'POST',
				body: payload,
			}),
			onQueryStarted() {
				// До инвалидации тегов: перезапрос должен уйти уже с новым ключом.
				patientsCache.bump()
			},
			invalidatesTags: () => [
				{ type: 'Patient', id: 'LIST' },
				{ type: 'MedWorker', id: 'SELF' },
			],
		}),
		getMedWorkerPatients: builder.query<GetMedWorkerPatientsResult, GetMedWorkerPatientsArgs>({
			query: ({ doctorId }) => ({
				url: `/med_worker/patients/${encodeURIComponent(doctorId)}`,
				// Мимо `cache_page(60)` — см. комментарий у patientsCache.
				params: { _: patientsCache.value() },
			}),
			transformResponse: (response: GetMedWorkerPatientsApiResponse): GetMedWorkerPatientsResult => {
				const { cards: cardsRaw, medWorker, count } = extractCardsAndMedWorker(response)
				const cards: CytologyPatientCard[] = cardsRaw.map(item => ({
					cardId: String(item.id),
					patientId: String(item.patient?.id ?? ''),
					fullName: normalizeName(item.patient),
					email: item.patient?.email ?? '',
					policyNumber: item.patient?.personal_policy ?? '',
					diagnosis: item.diagnosis ?? '',
					active: Boolean(item.patient?.is_active),
					birthDate: formatApiDateToDisplay(item.patient?.birth_date),
				}))

				const rows: PatientRow[] = cards.map(item => ({
					id: item.cardId,
					fullName: item.fullName,
					policyNumber: item.policyNumber,
					email: item.email,
					birthDate: item.birthDate,
					diagnosisLabel: item.diagnosis || 'Не обнаружено',
					statusLabel: item.active ? 'Активен' : 'Не активен',
					statusTone: item.active ? 'success' : 'default',
				}))

				const total = count ?? cards.length

				return {
					rows,
					cards,
					total,
					medWorkerName: normalizeMedWorkerName(medWorker),
					doctorProfile: mapMedWorkerToProfile(medWorker),
				}
			},
			providesTags: () => [
				{ type: 'Patient', id: 'LIST' },
				{ type: 'MedWorker', id: 'SELF' },
			],
		}),
	}),
})

export const { useGetMedWorkerPatientsQuery, useAddPatientMutation } = patientsApi
