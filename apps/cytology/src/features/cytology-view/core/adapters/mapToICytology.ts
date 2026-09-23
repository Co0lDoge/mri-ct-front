import type { CytologyInfoResponse } from '@/lib/cytologyApi'

import type { ICytology, ICytologyInfo, ICytologyInfoDetails } from '../types/cytology'
import type { IPatientInfo } from '../types/patient'

function parseFullname(fullname: string): Pick<IPatientInfo, 'first_name' | 'last_name' | 'fathers_name'> {
	const parts = fullname.trim().split(/\s+/).filter(Boolean)
	return {
		last_name: parts[0] ?? '',
		first_name: parts[1] ?? '',
		fathers_name: parts.slice(2).join(' '),
	}
}

function mapPatient(apiPatient: NonNullable<CytologyInfoResponse['info']>['patient']): IPatientInfo {
	if (!apiPatient?.fullname) {
		return {
			id: 0,
			first_name: '',
			last_name: '',
			fathers_name: '',
			birth_date: '',
			personal_policy: '',
			email: '',
			is_active: true,
		}
	}

	const names = parseFullname(apiPatient.fullname)
	return {
		id: Number(apiPatient.id) || 0,
		...names,
		birth_date: apiPatient.birth_date ?? '',
		personal_policy: apiPatient.policy ?? '',
		email: apiPatient.email ?? '',
		is_active: apiPatient.active ?? true,
	}
}

function hasCytologyDetails(details?: ICytologyInfoDetails | null): boolean {
	if (!details) {
		return false
	}
	if (details.probs?.length) {
		return true
	}
	const values = [
		...Object.values(details.cell_characteristics ?? {}),
		...Object.values(details.cluster_characteristics ?? {}),
	]
	return values.some(value => value !== null && value !== undefined && !Number.isNaN(value))
}

function resolveImagePath(flat: CytologyInfoResponse): string {
	const nested = (
		flat as CytologyInfoResponse & {
			original_image?: { image?: string; file_path?: string } | null
		}
	).original_image
	if (nested && typeof nested === 'object') {
		return nested.image ?? nested.file_path ?? ''
	}
	return flat.image ?? flat.file_path ?? ''
}

export function mapToICytology(flat: CytologyInfoResponse): ICytology {
	const rawCardId = Number(flat.info?.patient_card)
	const patientCardId = Number.isFinite(rawCardId) ? rawCardId : 0
	const details = (flat.details ?? {}) as ICytologyInfoDetails
	const imagePath = resolveImagePath(flat)

	const info: ICytologyInfo = {
		id: Number(flat.info?.id ?? flat.id ?? 0),
		patient: mapPatient(flat.info?.patient),
		acceptance_datetime: flat.diagnos_date ?? '',
		diagnosis: flat.info?.diagnosis ?? '',
		patient_card_id: patientCardId,
		is_last: flat.info?.is_last ?? true,
		diagnos_date: flat.diagnos_date ?? '',
		details: details.probs ? details : null,
		diagnostic_marking: (flat.diagnostic_marking ?? 'П11') as ICytologyInfo['diagnostic_marking'],
		diagnostic_number: Number(flat.diagnostic_number ?? 0),
		material_type: (flat.material_type ?? 'GS') as ICytologyInfo['material_type'],
		calcitonin: flat.info?.calcitonin ?? 0,
		calcitonin_in_flush: flat.info?.calcitonin_in_flush ?? 0,
		thyroglobulin: flat.info?.thyroglobulin ?? 0,
		prev: null,
		parent_prev: null,
		original_image: null,
	}

	return {
		original_image: {
			id: Number(flat.id ?? 0),
			create_date: flat.diagnos_date ?? '',
			delay_time: 0,
			viewed_flag: true,
			image: imagePath,
		},
		info,
	}
}
