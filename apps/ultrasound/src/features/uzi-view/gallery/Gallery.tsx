import { useCallback, useMemo, useState } from 'react'
import { Alert, Spin } from 'antd'
import OpenSeadragonViewer from '../viewer/ThyroidAnnotatedViewer'
import GalleryToolbar from './GalleryToolbar'
import NoImageState from './NoImageState'
import { useGalleryImageSource } from './useGalleryImageSource'
import type { GalleryProps } from './types'

const Gallery = ({
	link1,
	seg,
	imageid,
	image_count,
	slide_template,
	slide_urls,
	isEditMode = false,
	currentGroup,
	onStartEdit,
	onSaveEdit,
	onCancelEdit,
	isSaving = false,
	hasUnsavedChanges = false,
	onDraftChangesChange,
	viewerResetKey = 0,
	viewerHeight = 600,
	thyroidStructures,
}: GalleryProps) => {
	// Выбранный узел: снаружи (currentGroup) → выбор пользователя → первый узел.
	// Держим только пользовательский выбор, остальное выводим при рендере —
	// иначе нужен эффект с setState и каскадные ре-рендеры.
	const [pickedGroup, setPickedGroup] = useState<string | number | undefined>()
	const selectedGroup = currentGroup ?? pickedGroup ?? seg[0]?.id

	const [flushPendingSelection, setFlushPendingSelection] = useState<(() => Promise<void>) | null>(null)

	const { isLoading, imageSource, slidesUnavailable } = useGalleryImageSource({
		link1,
		image_count,
		slide_template,
		slide_urls,
	})

	const handleSaveClick = async () => {
		await flushPendingSelection?.()
		await onSaveEdit?.()
	}

	const handleViewerApiReady = useCallback((api: { flushPendingSelection: () => Promise<void> }) => {
		setFlushPendingSelection(() => api.flushPendingSelection)
	}, [])

	const segmentOptions = useMemo(
		() =>
			seg.map((segment, index) => ({
				value: segment.id,
				label: `Узел ${index + 1} · TI-RADS ${segment.details?.nodule_type ?? '-'}`,
			})),
		[seg],
	)

	if (!link1) {
		return <NoImageState />
	}

	return (
		<div>
			<GalleryToolbar
				isEditMode={isEditMode}
				currentGroup={selectedGroup}
				segmentOptions={segmentOptions}
				onSelectGroup={setPickedGroup}
				onStartEdit={onStartEdit}
				onSave={handleSaveClick}
				onCancel={onCancelEdit}
				isSaving={isSaving}
				hasUnsavedChanges={hasUnsavedChanges}
			/>

			{isLoading ? (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: viewerHeight,
					}}
				>
					<Spin size='large' />
				</div>
			) : slidesUnavailable ? (
				<div style={{ minHeight: viewerHeight, display: 'flex', alignItems: 'center' }}>
					<Alert
						type='warning'
						showIcon
						style={{ width: '100%' }}
						message='Кадры снимка ещё не готовы'
						description='Для TIFF и DICOM бэкенд готовит PNG-нарезку. Если снимок загружен только что — обновите страницу через минуту.'
					/>
				</div>
			) : (
				<div style={{ height: viewerHeight }}>
					<OpenSeadragonViewer
						key={`viewer-${viewerResetKey}-${isEditMode ? 'edit' : 'view'}`}
						image={imageSource}
						seg={seg}
						imageid={imageid}
						height={viewerHeight}
						readOnly={!isEditMode}
						currentGroup={selectedGroup}
						onDraftChangesChange={onDraftChangesChange}
						onViewerApiReady={handleViewerApiReady}
						thyroidStructures={thyroidStructures}
					/>
				</div>
			)}
		</div>
	)
}

export default Gallery
