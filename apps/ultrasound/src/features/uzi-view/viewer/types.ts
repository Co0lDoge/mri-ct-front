import type { Segment, SegmentDraftChange } from '../model/types'
import type { ImageTile } from '../gallery/types'
import type { ThyroidStructureJson } from '../structures'

/** Императивный API аннотатора, отдаваемый наружу (см. `Gallery`). */
export interface AnnotoriousViewerApi {
	/** Досохраняет незакоммиченное выделение перед сохранением сегментов. */
	flushPendingSelection: () => Promise<void>
}

export interface ThyroidAnnotatedViewerProps {
	image: ImageTile | ImageTile[]
	seg: Segment[]
	imageid: string | number
	readOnly?: boolean
	height?: number
	currentGroup?: string | number
	onDraftChangesChange?: (changes: SegmentDraftChange[]) => void
	onViewerApiReady?: (api: AnnotoriousViewerApi) => void
	thyroidStructures?: ThyroidStructureJson
}
