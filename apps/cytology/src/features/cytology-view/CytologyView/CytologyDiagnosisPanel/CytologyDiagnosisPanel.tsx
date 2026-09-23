import React from 'react'
import { skipToken } from '@reduxjs/toolkit/query'

import { useAppDispatch, useAppSelector } from '@cytology/core/hooks'
import { setCurrentSegment } from '@cytology/core/store'
import { useGetCytologyTypesQuery } from '@cytology/core/service/cytology'
import { Modes } from '@cytology/core/types/basic'
import { IGroupedSegments, SegmentType } from '@cytology/core/types/segments'

import { CYTOLOGY_EDITING_ENABLED } from '@/lib/cytologyFeatures'

import CytologyDiagnosisEdit from './CytologyDiagnosisEdit/CytologyDiagnosisEdit'
import CytologyDiagnosis from './CytologyDiagnosis/CytologyDiagnosis'

interface CytologyDiagnosisPanelProps {
	mode: Modes
	segments: IGroupedSegments[]
	changeMode: (newMode: Modes) => void
}

const CytologyDiagnosisPanel: React.FC<CytologyDiagnosisPanelProps> = ({ segments, mode, changeMode }) => {
	const dispatch = useAppDispatch()
	const currentSegment = useAppSelector(state => state.segment.currentSegment)
	const cytologyId = useAppSelector(state => state.cytology.cytologyId)
	const accessToken = useAppSelector(state => state.auth.accessToken)

	const { data: segmentTypes = [] } = useGetCytologyTypesQuery(accessToken && cytologyId ? cytologyId : skipToken)

	const handleClickCard = (segmentType: SegmentType) => {
		if (mode === 'edit') {
			dispatch(setCurrentSegment(segmentType))
			return
		}
		dispatch(setCurrentSegment(segmentType === currentSegment ? null : segmentType))
	}

	const handleOpenEdit = () => {
		if (!currentSegment && segmentTypes.length > 0) {
			dispatch(setCurrentSegment(segmentTypes[0].code as SegmentType))
		}
		changeMode('edit')
	}

	return (
		<div>
			{/* Флаг проверяем и здесь: даже если режим `edit` придёт откуда-то
                ещё, редактор не смонтируется. */}
			{mode === 'view' || !CYTOLOGY_EDITING_ENABLED ? (
				<CytologyDiagnosis
					segments={segments}
					openEdit={handleOpenEdit}
					currentSegment={currentSegment}
					onClickCard={handleClickCard}
				/>
			) : (
				<CytologyDiagnosisEdit
					segments={segments}
					currentSegment={currentSegment}
					closeEdit={() => changeMode('view')}
					onClickCard={handleClickCard}
				/>
			)}
		</div>
	)
}

export default CytologyDiagnosisPanel
