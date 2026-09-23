import { useCallback, useState } from 'react'
import { message } from 'antd'
import {
	useAddUziSegmentContourMutation,
	useDeleteUziSegmentContourMutation,
	useUpdateUziSegmentContourMutation,
} from '@/api/uziApi'
import type { Segment, SegmentDraftChange } from './types'

export interface UseThyroidSegmentEditorOptions {
	uziId: string
	/** Сегментация с сервера — единственный источник правды после сохранения. */
	serverSegmentation: Segment[] | undefined
}

export interface UseThyroidSegmentEditorResult {
	isEditMode: boolean
	isSaving: boolean
	hasUnsavedChanges: boolean
	displaySegmentation: Segment[]
	viewerResetKey: number
	setPendingChanges: (changes: SegmentDraftChange[]) => void
	startEdit: () => void
	cancelEdit: () => void
	saveSegments: () => Promise<void>
}

/**
 * Режим редактирования контуров узлов.
 *
 * Запись идёт через RTK Query (`uziApi`): токен подставляет baseQuery, а
 * `invalidatesTags` перечитывает снимок — поэтому отображаемая сегментация
 * это всегда данные сервера, без локального «применения» черновиков.
 */
export function useThyroidSegmentEditor({
	uziId,
	serverSegmentation,
}: UseThyroidSegmentEditorOptions): UseThyroidSegmentEditorResult {
	const [isEditMode, setIsEditMode] = useState(false)
	const [pendingChanges, setPendingChanges] = useState<SegmentDraftChange[]>([])
	const [viewerResetKey, setViewerResetKey] = useState(0)

	const [addContour, { isLoading: isAdding }] = useAddUziSegmentContourMutation()
	const [updateContour, { isLoading: isUpdating }] =
		useUpdateUziSegmentContourMutation()
	const [deleteContour, { isLoading: isDeleting }] =
		useDeleteUziSegmentContourMutation()

	const isSaving = isAdding || isUpdating || isDeleting
	const displaySegmentation = serverSegmentation ?? []

	const startEdit = useCallback(() => {
		setIsEditMode(true)
		setPendingChanges([])
	}, [])

	const cancelEdit = useCallback(() => {
		setIsEditMode(false)
		setPendingChanges([])
		setViewerResetKey(prev => prev + 1)
		message.info('Изменения сегментов отменены')
	}, [])

	/**
	 * Для существующего контура id аннотации — это id с бэкенда. Для контуров,
	 * созданных в этой сессии, id локальный (`draft-…`), поэтому подбираем id
	 * сохранённого контура выбранного узла.
	 */
	const resolveContourId = useCallback(
		(change: SegmentDraftChange) => {
			if (/^\d+$/.test(String(change.annotationId))) {
				return String(change.annotationId)
			}
			const segment = displaySegmentation.find(
				item => String(item.id) === String(change.segment_group),
			)
			const contourId = segment?.data?.find(contour => contour.id != null)?.id
			return contourId != null ? String(contourId) : String(change.annotationId)
		},
		[displaySegmentation],
	)

	const saveSegments = useCallback(async () => {
		if (!pendingChanges.length) {
			setIsEditMode(false)
			message.success('Редактирование сегментов завершено')
			return
		}

		try {
			for (const change of pendingChanges) {
				if (change.type === 'create') {
					if (!change.segment_group) {
						throw new Error('Не выбран узел для нового контура')
					}
					await addContour({
						uziId,
						points: change.points || [],
						segmentGroup: change.segment_group,
					}).unwrap()
					continue
				}

				const contourId = resolveContourId(change)

				if (change.type === 'update') {
					await updateContour({
						uziId,
						contourId,
						points: change.points || [],
						segmentGroup: change.segment_group,
					}).unwrap()
					continue
				}

				await deleteContour({ uziId, contourId }).unwrap()
			}

			setIsEditMode(false)
			setPendingChanges([])
			setViewerResetKey(prev => prev + 1)
			message.success('Изменения сегментов сохранены')
		} catch (segmentError: any) {
			console.error('Error saving segments:', segmentError)
			message.error(
				segmentError?.data?.detail ||
					segmentError?.message ||
					'Ошибка при сохранении сегментов',
			)
		}
	}, [
		addContour,
		deleteContour,
		pendingChanges,
		resolveContourId,
		updateContour,
		uziId,
	])

	return {
		isEditMode,
		isSaving,
		hasUnsavedChanges: pendingChanges.length > 0,
		displaySegmentation,
		viewerResetKey,
		setPendingChanges,
		startEdit,
		cancelEdit,
		saveSegments,
	}
}
