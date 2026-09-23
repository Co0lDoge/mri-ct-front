import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { formatApiDateToDisplay } from '@medml/shared'
import { baseApi } from '@medml/store'
import type { PatientProfileViewModel } from '@medml/patient_view'

import { isThyroidBackend } from '@/lib/apiBackend'
import { formatProjection } from '@/lib/projection'

type ProfileBaseQuery = (arg: string | FetchArgs) => unknown

async function runProfileQuery(
	baseQuery: ProfileBaseQuery,
	arg: string | FetchArgs,
): Promise<{ data?: unknown; error?: FetchBaseQueryError }> {
	return (await baseQuery(arg)) as { data?: unknown; error?: FetchBaseQueryError }
}

export type PatientCardInfo = {
	diagnosis: string
	cardId: string | null
}

export type PatientUziStudyRow = {
	key: string
	projectionLabel: string
	checkedLabel: string
	deviceIdRaw: string
	statusRaw: string
	statusLabel: string
	createdAtLabel: string
}

type MedPatientDto = {
	id: string | number
	fullname: string
	email: string
	policy: string
	active: boolean
	malignancy: boolean
	birth_date?: string | null
	birthDate?: string | null
}

type MedPatientCardDto = {
	diagnosis?: unknown
}

type UziExternalItemDto = {
	id?: string
	projection?: string
	checked?: boolean
	external_id?: string
	author_id?: string
	device_id?: string | number
	status?: string
	create_at?: string
}

const STATUS_LABELS: Record<string, string> = {
	completed: 'Завершено',
	pending: 'Ожидание',
	processing: 'В обработке',
	in_progress: 'В работе',
	failed: 'Ошибка',
	error: 'Ошибка',
	new: 'Новое',
	cancelled: 'Отменено',
}

function diagnosisToDisplayString(value: unknown): string {
	if (value == null) return ''
	if (typeof value === 'string') return value
	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return String(value)
	}
}

function medPatientToProfile(raw: MedPatientDto): PatientProfileViewModel {
	return {
		id: String(raw.id),
		fullName: raw.fullname,
		email: raw.email,
		policyNumber: raw.policy,
		birthDate: formatApiDateToDisplay(raw.birth_date ?? raw.birthDate),
		active: raw.active,
		malignancy: raw.malignancy,
	}
}

function normalizeUzisPayload(response: unknown): UziExternalItemDto[] {
	if (Array.isArray(response)) return response as UziExternalItemDto[]
	if (response && typeof response === 'object' && Array.isArray((response as { results?: unknown }).results)) {
		return (response as { results: UziExternalItemDto[] }).results
	}
	return []
}

/** Подпись проекции; для продольной — вместе со стороной доли. */
function projectionLabel(projection: string | undefined, side?: string | null): string {
	return formatProjection(projection, side)
}

function statusLabel(status: string | undefined): string {
	if (status == null || String(status).trim() === '') return '—'
	const k = String(status).trim().toLowerCase()
	return STATUS_LABELS[k] ?? status
}

function formatDateOnly(iso: string | undefined): string {
	if (!iso?.trim()) return '—'
	const s = String(iso).trim()
	const ymd = /^(\d{4}-\d{2}-\d{2})/.exec(s)
	if (ymd) {
		return formatApiDateToDisplay(ymd[1]) ?? '—'
	}
	const d = new Date(s)
	if (Number.isNaN(d.getTime())) return '—'
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return formatApiDateToDisplay(`${y}-${m}-${day}`) ?? `${day}.${m}.${day}`
}

function mapMedUziItemsToRows(response: unknown): PatientUziStudyRow[] {
	const list = normalizeUzisPayload(response)
	return list.map((item, index) => {
		const rawStatus = String(item.status ?? '')
			.trim()
			.toLowerCase()
		return {
			key: String(item.id ?? index),
			projectionLabel: projectionLabel(item.projection),
			checkedLabel: item.checked === true ? 'Да' : item.checked === false ? 'Нет' : '—',
			deviceIdRaw: item.device_id != null && item.device_id !== '' ? String(item.device_id) : '',
			statusRaw: rawStatus,
			statusLabel: statusLabel(item.status),
			createdAtLabel: formatDateOnly(item.create_at),
		}
	})
}

async function fetchMedPatientById(
	patientId: string,
	baseQuery: ProfileBaseQuery,
): Promise<{ data: PatientProfileViewModel } | { error: FetchBaseQueryError }> {
	const result = await runProfileQuery(baseQuery, { url: `/med/patient/${patientId}` })
	if (result.error) {
		return { error: result.error }
	}
	return {
		data: medPatientToProfile(result.data as MedPatientDto),
	}
}

async function fetchMedPatientCard(
	doctorId: string,
	patientId: string,
	baseQuery: ProfileBaseQuery,
): Promise<{ data: PatientCardInfo } | { error: FetchBaseQueryError }> {
	const result = await runProfileQuery(baseQuery, {
		url: `/med/card/${doctorId}/${patientId}`,
	})
	if (result.error) {
		const e = result.error
		if (e.status === 404) {
			return { data: { diagnosis: '', cardId: null } }
		}
		return { error: e }
	}
	const raw = result.data as MedPatientCardDto | null | undefined
	return {
		data: {
			diagnosis: diagnosisToDisplayString(raw?.diagnosis),
			cardId: null,
		},
	}
}

async function fetchMedPatientUzis(
	patientId: string,
	baseQuery: ProfileBaseQuery,
): Promise<{ data: PatientUziStudyRow[] } | { error: FetchBaseQueryError }> {
	const result = await runProfileQuery(baseQuery, {
		url: `/uzis/external/${patientId}`,
	})
	if (result.error) {
		const e = result.error
		if (e.status === 404) {
			return { data: [] }
		}
		return { error: e }
	}
	return { data: mapMedUziItemsToRows(result.data) }
}

type ThyroidPatientDto = {
	id: number
	first_name?: string
	last_name?: string
	fathers_name?: string
	personal_policy?: string
	email?: string
	birth_date?: string | null
	is_active?: boolean
}

type ThyroidPatientCardRef = {
	id: number
	patient?: { id?: number }
}

type ThyroidUziStudyDto = {
	id?: number
	uzi_device_id?: number
	diagnos_date?: string
	details?: { projection_type?: string; projection_side?: string }
}

type ThyroidShotDto = {
	id?: number
	image?: number | null
	details?: { ai_info?: unknown } | null
}

function normalizeListResults<T>(response: unknown): T[] {
	if (Array.isArray(response)) return response as T[]
	if (response && typeof response === 'object') {
		const results = (response as { results?: unknown }).results
		if (Array.isArray(results)) return results as T[]
	}
	return []
}

function normalizeMedWorkerCards(response: unknown): ThyroidPatientCardRef[] {
	if (!response || typeof response !== 'object') return []
	const root = response as Record<string, unknown>
	if (Array.isArray(root.cards)) return root.cards as ThyroidPatientCardRef[]
	const results = root.results
	if (results && typeof results === 'object') {
		const inner = results as Record<string, unknown>
		if (Array.isArray(inner.cards)) return inner.cards as ThyroidPatientCardRef[]
	}
	return []
}

function thyroidPatientFullName(p: ThyroidPatientDto): string {
	return [p.last_name, p.first_name, p.fathers_name]
		.filter(part => typeof part === 'string' && part.trim().length > 0)
		.join(' ')
		.trim()
}

function thyroidPatientToProfile(raw: ThyroidPatientDto, diagnosis = ''): PatientProfileViewModel {
	return {
		id: String(raw.id),
		fullName: thyroidPatientFullName(raw) || '—',
		email: raw.email,
		policyNumber: String(raw.personal_policy ?? ''),
		birthDate: formatApiDateToDisplay(raw.birth_date) ?? '—',
		active: Boolean(raw.is_active),
		diagnosis,
	}
}

function normalizeThyroidShots(response: unknown): ThyroidShotDto[] {
	if (!response || typeof response !== 'object') return []

	const root = response as Record<string, unknown>
	if (Array.isArray(root.shots)) return root.shots as ThyroidShotDto[]

	const results = root.results
	if (results && typeof results === 'object') {
		const inner = results as Record<string, unknown>
		if (Array.isArray(inner.shots)) return inner.shots as ThyroidShotDto[]
	}

	return []
}

function deriveThyroidStatus(shot: ThyroidShotDto | undefined): string {
	if (!shot) return ''

	const aiInfo = shot.details?.ai_info
	if (Array.isArray(aiInfo) && aiInfo.length > 0) return 'completed'
	if (shot.image == null) return 'new'
	return 'processing'
}

function mapThyroidUziToRows(response: unknown, statusByStudyId: Map<string, string>): PatientUziStudyRow[] {
	const list = normalizeListResults<ThyroidUziStudyDto>(response)
	return list.map((item, index) => {
		const key = String(item.id ?? index)
		const rawStatus = statusByStudyId.get(key) ?? ''

		return {
			key,
			projectionLabel: projectionLabel(item.details?.projection_type, item.details?.projection_side),
			checkedLabel: '—',
			deviceIdRaw: item.uzi_device_id != null ? String(item.uzi_device_id) : '',
			statusRaw: rawStatus,
			statusLabel: statusLabel(rawStatus),
			createdAtLabel: formatDateOnly(item.diagnos_date),
		}
	})
}

async function fetchThyroidPatientById(
	patientId: string,
	baseQuery: ProfileBaseQuery,
): Promise<{ data: PatientProfileViewModel } | { error: FetchBaseQueryError }> {
	const result = await runProfileQuery(baseQuery, { url: `/patient/${patientId}/` })
	if (result.error) {
		return { error: result.error }
	}
	return {
		data: thyroidPatientToProfile(result.data as ThyroidPatientDto),
	}
}

async function fetchThyroidPatientCard(
	doctorId: string,
	patientId: string,
	baseQuery: ProfileBaseQuery,
): Promise<{ data: PatientCardInfo } | { error: FetchBaseQueryError }> {
	const listRes = await runProfileQuery(baseQuery, {
		url: `/med_worker/patients/${doctorId}`,
	})
	if (listRes.error) {
		return { error: listRes.error }
	}

	const cards = normalizeMedWorkerCards(listRes.data)
	const card = cards.find(c => c.patient?.id != null && String(c.patient.id) === String(patientId))
	if (!card) {
		return { data: { diagnosis: '', cardId: null } }
	}

	const cardRes = await runProfileQuery(baseQuery, {
		url: `/patient/update/${card.id}/`,
	})
	if (cardRes.error) {
		const e = cardRes.error
		if (e.status === 404) {
			return { data: { diagnosis: '', cardId: String(card.id) } }
		}
		return { error: e }
	}

	const raw = cardRes.data as { card?: { diagnosis?: unknown } } | null
	return {
		data: {
			diagnosis: diagnosisToDisplayString(raw?.card?.diagnosis),
			cardId: String(card.id),
		},
	}
}

async function fetchThyroidStatuses(patientId: string, baseQuery: ProfileBaseQuery): Promise<Map<string, string>> {
	const map = new Map<string, string>()

	const result = await runProfileQuery(baseQuery, {
		url: `/patient/shots/${patientId}/`,
	})
	if (result.error) return map

	for (const shot of normalizeThyroidShots(result.data)) {
		if (shot.id == null) continue
		map.set(String(shot.id), deriveThyroidStatus(shot))
	}

	return map
}

async function fetchThyroidPatientUzis(
	patientId: string,
	baseQuery: ProfileBaseQuery,
): Promise<{ data: PatientUziStudyRow[] } | { error: FetchBaseQueryError }> {
	const result = await runProfileQuery(baseQuery, {
		url: `/patient/uzis/${patientId}/`,
	})
	if (result.error) {
		return { error: result.error }
	}

	const statuses = await fetchThyroidStatuses(patientId, baseQuery)
	return { data: mapThyroidUziToRows(result.data, statuses) }
}

export const patientProfileApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getMedPatientById: builder.query<PatientProfileViewModel, string>({
			async queryFn(patientId, _api, _extraOptions, baseQuery) {
				const bq = baseQuery as ProfileBaseQuery
				if (isThyroidBackend()) {
					return fetchThyroidPatientById(patientId, bq)
				}
				return fetchMedPatientById(patientId, bq)
			},
			providesTags: (_result, _err, patientId) => [{ type: 'Patient', id: patientId }],
		}),

		getMedPatientCard: builder.query<PatientCardInfo, { doctorId: string; patientId: string }>({
			async queryFn({ doctorId, patientId }, _api, _extraOptions, baseQuery) {
				const bq = baseQuery as ProfileBaseQuery
				if (isThyroidBackend()) {
					return fetchThyroidPatientCard(doctorId, patientId, bq)
				}
				return fetchMedPatientCard(doctorId, patientId, bq)
			},
		}),

		getPatientUziStudies: builder.query<PatientUziStudyRow[], string>({
			async queryFn(patientId, _api, _extraOptions, baseQuery) {
				const bq = baseQuery as ProfileBaseQuery
				if (isThyroidBackend()) {
					return fetchThyroidPatientUzis(patientId, bq)
				}
				return fetchMedPatientUzis(patientId, bq)
			},
		}),
	}),
})

export const { useGetMedPatientByIdQuery, useGetMedPatientCardQuery, useGetPatientUziStudiesQuery } = patientProfileApi

export function uziStudyStatusTagColor(statusRaw: string): string {
	const k = statusRaw.trim().toLowerCase()
	if (k === 'completed') return 'success'
	if (k === 'pending' || k === 'new') return 'default'
	if (k === 'processing' || k === 'in_progress') return 'processing'
	if (k === 'failed' || k === 'error') return 'error'
	if (k === 'cancelled') return 'default'
	return 'default'
}
