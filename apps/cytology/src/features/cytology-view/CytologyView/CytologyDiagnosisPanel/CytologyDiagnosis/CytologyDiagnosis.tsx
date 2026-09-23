import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { Typography, Button, Tooltip, Flex } from 'antd'
import { EditOutlined, HistoryOutlined } from '@ant-design/icons'
import { skipToken } from '@reduxjs/toolkit/query'

import DiagnosisCard from '@cytology/common/DiagnosisCard/DiagnosisCard'

import { IGroupedSegments, ISegmentType, SegmentType } from '@cytology/core/types/segments'
import { useGetCytologyHistoryQuery, useGetCytologyTypesQuery } from '@cytology/core/service/cytology'
import { useAppSelector } from '@cytology/core/hooks'
import { ModalContext } from '@medml/ui'

import { CYTOLOGY_EDITING_ENABLED } from '@/lib/cytologyFeatures'

import CytologyInfo from './CytologyInfo/CytologyInfo'

import './CytologyDiagnosis.css'
import CytologyHistory from './CytologyHistory/CytologyHistory'

const { Text } = Typography

interface ICytologyDiagnosisProps {
	segments: IGroupedSegments[]
	openEdit: () => void
	onClickCard: (newValue: SegmentType) => void
	currentSegment: SegmentType | null
}

const CytologyDiagnosis: React.FC<ICytologyDiagnosisProps> = ({ segments, openEdit, onClickCard, currentSegment }) => {
	const { open } = useContext(ModalContext)
	const cytologyId = useAppSelector(state => state.cytology.cytologyId)
	const acessToken = useAppSelector(state => state.auth.accessToken)
	const cytologyInfo = useAppSelector(state => state.cytology.cytologyInfo)

	const { data: segmentTypes = [] } = useGetCytologyTypesQuery(acessToken && cytologyId ? cytologyId : skipToken)

	const { data: historyData } = useGetCytologyHistoryQuery(acessToken ? cytologyId : skipToken)
	const historyDataRef = useRef(historyData)

	useEffect(() => {
		historyDataRef.current = historyData
	}, [historyData])

	const handleOpenHistory = useCallback(() => {
		if (historyDataRef.current) {
			open({
				content: <CytologyHistory history={historyDataRef.current} />,
			})
		}
	}, [historyDataRef, open])

	const isLastRevision = cytologyInfo?.is_last ?? true

	return (
		<Flex vertical className='cytology-diagnosis-wrapper'>
			<CytologyInfo />
			<Flex vertical gap={5} className='cytology-diagnosis-cards-wrapper'>
				{segmentTypes.map((segment: ISegmentType) => (
					<DiagnosisCard
						segmentType={segment.code as SegmentType}
						label={segment.label}
						isActive={currentSegment === (segment.code as SegmentType)}
						onClick={() => onClickCard(segment.code as SegmentType)}
						key={segment.code}
					/>
				))}
			</Flex>
			<Button className='cytology-diagnosis-edit' type='default' onClick={handleOpenHistory}>
				<Flex gap={10} align='center'>
					<Text className='text-inherit'>История изменений</Text>
					<HistoryOutlined />
				</Flex>
			</Button>
			{CYTOLOGY_EDITING_ENABLED && (
				<Tooltip title={!isLastRevision ? 'Для редактирования необходимо перейти на последнюю ревизию' : undefined}>
					<Button className='cytology-diagnosis-edit' type='primary' onClick={openEdit} disabled={!isLastRevision}>
						<Flex gap={10} align='center'>
							<Text className='text-inherit'>Редактировать</Text>
							<EditOutlined />
						</Flex>
					</Button>
				</Tooltip>
			)}
		</Flex>
	)
}

export default CytologyDiagnosis
