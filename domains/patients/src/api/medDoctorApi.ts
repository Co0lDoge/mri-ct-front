import { baseApi } from '@medml/store'
import type { DoctorProfileViewModel } from '@medml/doctor_profile'

export type MedDoctorDto = {
	id: string
	fullname: string
	org: string
	job: string
	description?: string
}

export function buildDoctorInitials(fullname: string): string {
	return fullname
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(word => word[0] ?? '')
		.join('')
		.toUpperCase()
}

export function mapMedDoctorToProfile(dto: MedDoctorDto): DoctorProfileViewModel {
	const [lastName = '', firstName = '', fathersName = ''] = dto.fullname.trim().split(/\s+/)

	return {
		id: dto.id,
		fullName: dto.fullname,
		initials: buildDoctorInitials(dto.fullname),
		lastName,
		firstName,
		fathersName,
		speciality: dto.job || null,
		organization: dto.org || null,
		// Признака удалённого эксперта в med-сервисе нет.
		isRemoteWorker: false,
		expertDetails: dto.description ?? '',
	}
}

export const medDoctorApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getMedDoctor: builder.query<DoctorProfileViewModel, string>({
			query: doctorId => `/med/doctor/${encodeURIComponent(doctorId)}`,
			transformResponse: (raw: MedDoctorDto) => mapMedDoctorToProfile(raw),
			providesTags: () => [{ type: 'MedWorker', id: 'SELF' }],
		}),
	}),
})

export const { useGetMedDoctorQuery } = medDoctorApi
