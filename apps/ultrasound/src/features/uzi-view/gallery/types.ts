import type { Segment, SegmentDraftChange } from '../model/types'
import type { ThyroidStructureJson } from '../structures'

/**
 * Кадр снимка в виде, пригодном для OSD tileSource.
 * Раньше существовал в двух почти одинаковых копиях (`ImageTile` и
 * `ImageSource`) — объединено в один тип.
 */
export interface ImageTile {
	type: 'image'
	url: string
	width?: number
	height?: number
}

export interface TiffSlidesOptions {
	slide_urls?: string[]
	slide_template?: string[]
	image_count?: number
}

export interface GalleryProps {
	link1: string | null
	seg: Segment[]
	imageid: string | number
	image_count: number
	slide_template?: string[]
	slide_urls?: string[]
	isEditMode?: boolean
	currentGroup?: string | number
	onStartEdit?: () => void
	onSaveEdit?: () => void | Promise<void>
	onCancelEdit?: () => void
	isSaving?: boolean
	hasUnsavedChanges?: boolean
	onDraftChangesChange?: (changes: SegmentDraftChange[]) => void
	viewerResetKey?: number
	viewerHeight?: number
	thyroidStructures?: ThyroidStructureJson
}

export interface GalleryToolbarProps {
	isEditMode: boolean
	currentGroup?: string | number
	segmentOptions?: Array<{ value: string | number; label: string }>
	onSelectGroup?: (value: string | number) => void
	onStartEdit?: () => void
	onSave?: () => void | Promise<void>
	onCancel?: () => void
	isSaving?: boolean
	hasUnsavedChanges?: boolean
}
