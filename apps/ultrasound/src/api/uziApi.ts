import { baseApi } from '@medml/store'

import { isThyroidBackend } from '@/lib/apiBackend'
import type {
	SegmentPoint,
	ThyroidUziApiResponse,
} from '@/features/uzi-view/model/types'

function normalizeListResults<T>(response: unknown): T[] {
	if (Array.isArray(response)) return response as T[]
	if (response && typeof response === 'object') {
		const results = (response as { results?: unknown }).results
		if (Array.isArray(results)) return results as T[]
	}
	return []
}

export type UziDeviceDto = {
	id: string
	name: string
}

export const uziApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getUziDevices: builder.query<UziDeviceDto[], void>({
			query: () => ({ url: '/uzi/devices/' }),
			transformResponse: (response: unknown) =>
				normalizeListResults<UziDeviceDto>(response).map(d => ({
					id: String(d.id),
					name: d.name,
				})),
		}),

		/** Thyroid: полный bundle для ResultsPage (`?format=json`). */
		getThyroidUziData: builder.query<ThyroidUziApiResponse, string>({
			query: uziId => `/uzi/${encodeURIComponent(uziId)}/?format=json`,
			providesTags: (_result, _error, uziId) => [{ type: 'Uzi', id: uziId }],
		}),

		updateThyroidUziData: builder.mutation<
			void,
			{ uziId: string; data: unknown }
		>({
			query: ({ uziId, data }) => ({
				url: `/uzi/${encodeURIComponent(uziId)}/update/`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (_result, _error, { uziId }) => [
				{ type: 'Uzi', id: uziId },
			],
		}),

		/**
		 * Контуры сегментов. Раньше эти три запроса шли мимо RTK Query через
		 * axios с ручным заголовком Authorization — теперь токен подставляет
		 * baseQuery, а `invalidatesTags` сам перечитывает снимок после записи,
		 * поэтому локальное применение черновиков больше не нужно.
		 *
		 * `uziId` в аргументах не участвует в URL — он нужен только для
		 * инвалидации кэша конкретного снимка.
		 */
		addUziSegmentContour: builder.mutation<
			{ id: number },
			{ uziId: string; points: SegmentPoint[]; segmentGroup: string | number }
		>({
			query: ({ points, segmentGroup }) => ({
				url: '/uzi/segment/add/',
				method: 'POST',
				body: { points, segment_group: segmentGroup },
			}),
			invalidatesTags: (_r, _e, { uziId }) => [{ type: 'Uzi', id: uziId }],
		}),

		updateUziSegmentContour: builder.mutation<
			void,
			{
				uziId: string
				contourId: string
				points: SegmentPoint[]
				segmentGroup?: string | number
			}
		>({
			query: ({ contourId, points, segmentGroup }) => ({
				url: `/uzi/segment/update/${encodeURIComponent(contourId)}/`,
				method: 'PUT',
				body: {
					points,
					...(segmentGroup ? { segment_group: segmentGroup } : {}),
				},
			}),
			invalidatesTags: (_r, _e, { uziId }) => [{ type: 'Uzi', id: uziId }],
		}),

		deleteUziSegmentContour: builder.mutation<
			void,
			{ uziId: string; contourId: string }
		>({
			query: ({ contourId }) => ({
				url: `/uzi/segment/update/${encodeURIComponent(contourId)}/`,
				method: 'DELETE',
			}),
			invalidatesTags: (_r, _e, { uziId }) => [{ type: 'Uzi', id: uziId }],
		}),
		uploadUziDiagnostic: builder.mutation<
			unknown,
			{
				file: File
				projection: string
				projectionSide?: string
				/** Thyroid: id карты (`patient_card`). Med: id пациента (`external_id`). */
				patientRefId: string
				deviceId: string
			}
		>({
			query: ({ file, projection, projectionSide, patientRefId, deviceId }) => {
				const formData = new FormData()
				if (isThyroidBackend()) {
					formData.append('original_image', file)
					formData.append('projection_type', projection)
					if (projectionSide) {
						formData.append('projection_side', projectionSide)
					}
					formData.append('patient_card', patientRefId)
					formData.append('uzi_device', deviceId)
					return {
						url: '/uzi/create/',
						method: 'POST',
						body: formData,
					}
				}
				formData.append('file', file)
				formData.append('projection', projection)
				if (projectionSide) {
					formData.append('projectionSide', projectionSide)
				}
				formData.append('external_id', patientRefId)
				formData.append('device_id', deviceId)
				return {
					url: '/uzi',
					method: 'POST',
					body: formData,
				}
			},
			invalidatesTags: () => [{ type: 'Patient', id: 'LIST' }],
		}),
	}),
})

export const {
	useGetUziDevicesQuery,
	useUploadUziDiagnosticMutation,
	useGetThyroidUziDataQuery,
	useUpdateThyroidUziDataMutation,
	useAddUziSegmentContourMutation,
	useUpdateUziSegmentContourMutation,
	useDeleteUziSegmentContourMutation,
} = uziApi
