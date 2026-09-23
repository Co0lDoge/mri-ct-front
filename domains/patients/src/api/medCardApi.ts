import { baseApi } from '@medml/store'

export type MedCardDto = {
	uuid?: string
	patient_id: string
	doctor_id: string
	diagnosis?: string
}

export type MedCard = {
	uuid: string | null
	patientId: string
	doctorId: string
	diagnosis: string
}

export type MedCardArgs = {
	doctorId: string
	patientId: string
}

export function mapMedCard(dto: MedCardDto): MedCard {
	const uuid = dto.uuid?.trim()
	return {
		uuid: uuid ? uuid : null,
		patientId: dto.patient_id,
		doctorId: dto.doctor_id,
		diagnosis: dto.diagnosis ?? '',
	}
}

export const medCardApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getMedCard: builder.query<MedCard, MedCardArgs>({
			query: ({ doctorId, patientId }) => `/med/card/${encodeURIComponent(doctorId)}/${encodeURIComponent(patientId)}`,
			transformResponse: (raw: MedCardDto) => mapMedCard(raw),
			providesTags: (_result, _error, { patientId }) => [{ type: 'Patient', id: patientId }],
		}),

		updateMedCardDiagnosis: builder.mutation<MedCard, MedCardArgs & { diagnosis: string }>({
			query: ({ doctorId, patientId, diagnosis }) => ({
				url: `/med/card/${encodeURIComponent(doctorId)}/${encodeURIComponent(patientId)}`,
				method: 'PATCH',
				body: { diagnosis },
			}),
			transformResponse: (raw: MedCardDto) => mapMedCard(raw),
			invalidatesTags: (_result, _error, { patientId }) => [
				{ type: 'Patient', id: patientId },
				{ type: 'Patient', id: 'LIST' },
			],
		}),
	}),
})

export const { useGetMedCardQuery, useLazyGetMedCardQuery, useUpdateMedCardDiagnosisMutation } = medCardApi
