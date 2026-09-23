import { formatApiDateToDisplay } from '@medml/shared'
import { baseApi } from '@medml/store'
import type { PatientListSortOrder, PatientRow } from '@medml/patient_list'

/**
 * Пациенты и карты через med-сервис.
 *
 * Один набор ручек на все приложения: и УЗИ, и цитология ходят в
 * composition-api за одним и тем же списком пациентов врача.
 */

/** Пациент в ответе med-сервиса. */
export type MedPatientDto = {
	id: string | number
	fullname: string
	active: boolean
	email: string
	policy: string
	malignancy: boolean
	birth_date?: string | null
	/** Django-вариант того же поля. */
	birthDate?: string | null
	last_uzi_date?: string | null
}

export type CreateMedPatientBody = {
	email: string
	fullname: string
	policy: string
	active: boolean
	malignancy: boolean
	birth_date: string
}

export type CreateMedCardBody = {
	patient_id: string
	doctor_id: string
	diagnosis: string
}

export type CreateMedPatientResponse = {
	id: string
}

export type GetMedDoctorPatientsArgs = {
	doctorId: string
	status?: boolean
}

export type GetMedDoctorPatientsResult = {
	rows: PatientRow[]
	total: number
}

/**
 * Ответ приходит либо голым массивом, либо
 * страницей `{results, count}` — Django-совместимая форма.
 */
export function normalizeMedPatientsPayload(response: unknown): MedPatientDto[] {
	if (Array.isArray(response)) return response as MedPatientDto[]

	if (response && typeof response === 'object' && Array.isArray((response as { results?: unknown }).results)) {
		return (response as { results: MedPatientDto[] }).results
	}

	return []
}

export function mapMedPatientToRow(item: MedPatientDto): PatientRow {
	return {
		id: String(item.id),
		fullName: item.fullname,
		policyNumber: item.policy,
		email: item.email,
		birthDate: formatApiDateToDisplay(item.birth_date ?? item.birthDate),
		diagnosisLabel: item.malignancy ? 'Обнаружено' : 'Не обнаружено',
		statusLabel: item.active ? 'Активен' : 'Не активен',
		statusTone: item.active ? 'success' : 'default',
	}
}

export function filterMedPatientRows(rows: PatientRow[], search?: string): PatientRow[] {
	const query = search?.trim().toLowerCase()
	if (!query) return rows

	return rows.filter(
		row =>
			row.fullName.toLowerCase().includes(query) ||
			String(row.policyNumber ?? '')
				.toLowerCase()
				.includes(query),
	)
}

export function sortMedPatientRows(
	rows: PatientRow[],
	sortKey?: keyof PatientRow | null,
	sortOrder?: PatientListSortOrder,
): PatientRow[] {
	if (!sortKey || !sortOrder) return rows

	const direction = sortOrder === 'descend' ? -1 : 1
	return [...rows].sort((a, b) => {
		const left = String(a[sortKey] ?? '')
		const right = String(b[sortKey] ?? '')
		return left.localeCompare(right, 'ru') * direction
	})
}

export const medPatientsApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		/** `GET /med/doctor/{id}/patients` — список пациентов врача. */
		getMedDoctorPatients: builder.query<GetMedDoctorPatientsResult, GetMedDoctorPatientsArgs>({
			query: ({ doctorId, status }) => ({
				url: `/med/doctor/${encodeURIComponent(doctorId)}/patients`,
				params: status == null ? undefined : { status },
			}),
			transformResponse: (response: unknown): GetMedDoctorPatientsResult => {
				const rows = normalizeMedPatientsPayload(response).map(mapMedPatientToRow)
				return { rows, total: rows.length }
			},
			providesTags: () => [{ type: 'Patient', id: 'LIST' }],
		}),

		/** `POST /med/patient` — сам пациент, без привязки к врачу. */
		createMedPatient: builder.mutation<CreateMedPatientResponse, CreateMedPatientBody>({
			query: body => ({ url: '/med/patient', method: 'POST', body }),
			transformResponse: (raw: { id?: string | number }) => ({ id: String(raw?.id ?? '') }),
			invalidatesTags: () => [{ type: 'Patient', id: 'LIST' }],
		}),

		/** `POST /med/card` — карта, связывающая пациента с врачом. */
		createMedPatientCard: builder.mutation<unknown, CreateMedCardBody>({
			query: body => ({ url: '/med/card', method: 'POST', body }),
			invalidatesTags: () => [{ type: 'Patient', id: 'LIST' }],
		}),
	}),
})

export const { useGetMedDoctorPatientsQuery, useCreateMedPatientMutation, useCreateMedPatientCardMutation } =
	medPatientsApi
