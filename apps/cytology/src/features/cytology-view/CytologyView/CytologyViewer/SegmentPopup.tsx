import React, { useEffect, useReducer, useState } from 'react'
import type { OpenSeadragonAnnotator, Selection } from '@annotorious/openseadragon'
import { imageToElementPoint } from '@medml/viewers'

import CommentPopup from './Viewer/components/CommentPopup/CommentPopup'

/**
 * Карточка сегмента рядом с выделенной разметкой.
 */

interface SegmentPopupProps {
	annotator: OpenSeadragonAnnotator | null
	isEditingMode?: boolean
	needInput?: boolean
}

/** Отступ от угла разметки, чтобы карточка не накрывала сам сегмент. */
const POPUP_OFFSET = 8

const SegmentPopup: React.FC<SegmentPopupProps> = ({ annotator, isEditingMode = false, needInput = false }) => {
	// Инстанс движка берём у самого аннотатора: он к нему привязан, и лишнее
	// состояние в вызывающем компоненте не нужно.
	const viewer = annotator?.viewer ?? null

	const [selectedId, setSelectedId] = useState<string | null>(null)

	// Значение счётчика не нужно — он существует только ради перерисовки.
	// Позиция карточки считается на рендере из текущего состояния вьюпорта,
	// поэтому достаточно сообщить React, что вьюпорт сдвинулся.
	const [, bumpViewport] = useReducer((version: number) => version + 1, 0)

	useEffect(() => {
		if (!annotator) {
			return
		}

		return annotator.state.selection.subscribe(({ selected }: Selection) => {
			setSelectedId(selected?.[0]?.id ?? null)
		})
	}, [annotator])

	// Карточка привязана к точке на снимке, поэтому должна ехать вместе с ним
	// при зуме и панорамировании.
	useEffect(() => {
		if (!viewer) {
			return
		}

		viewer.addHandler('update-viewport', bumpViewport)

		return () => {
			viewer.removeHandler('update-viewport', bumpViewport)
		}
	}, [viewer])

	const annotation = selectedId ? annotator?.getAnnotationById(selectedId) : undefined
	const bounds = annotation?.target?.selector?.geometry?.bounds
	const position = viewer && bounds ? imageToElementPoint(viewer, bounds.maxX, bounds.minY) : null

	if (!annotation || !position) {
		return null
	}

	return (
		<div className='cytology-segment-popup' style={{ left: position.x + POPUP_OFFSET, top: position.y }}>
			<CommentPopup annotation={annotation} needInput={needInput} isEditingMode={isEditingMode} />
		</div>
	)
}

export default SegmentPopup
