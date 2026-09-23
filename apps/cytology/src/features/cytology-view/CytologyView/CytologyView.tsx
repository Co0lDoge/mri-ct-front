import React, { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row, Typography, theme } from 'antd'
import { skipToken } from '@reduxjs/toolkit/query'

import { StudyPatientCard } from '@medml/patient_view'
import { getSurfaceCardStyle } from '@medml/ui'
import { useViewerFocusMode, ViewerFocusBar } from '@medml/viewers'

import { useAppDispatch, useAppSelector } from '@cytology/core/hooks'
import {
	setCytologyId,
	setCytologyInfo,
	setEditedCytologyInfo,
	setInitSegments,
	setSegmentsStack,
} from '@cytology/core/store'
import {
	useGetCytologyInfoQuery,
	useGetCytologyTypesQuery,
	useLazyGetCytologySegmentsByTypeQuery,
} from '@cytology/core/service/cytology'
import { Modes } from '@cytology/core/types/basic'

import CytologyDiagnosisPanel from './CytologyDiagnosisPanel/CytologyDiagnosisPanel'
import CytologyViewer from './CytologyViewer/CytologyViewer'
import { IGroupedSegments, ISegmentStack, ISegmentType, SegmentType } from '@cytology/core/types/segments'

import './CytologyView.css'

const { Title, Text } = Typography

interface CytologyViewProps {
	generalCytologyId: string
}

const CytologyView: React.FC<CytologyViewProps> = ({ generalCytologyId }) => {
	const dispatch = useAppDispatch()
	const accessToken = useAppSelector(state => state.auth.accessToken)
	const currentSegment = useAppSelector(state => state.segment.currentSegment)
	const segmentStack: ISegmentStack[] = useAppSelector(state => state.segment.segmentStack)

	const [mode, setMode] = useState<Modes>('view')
	const [viewSegments, setViewSegments] = useState<ISegmentStack[]>([])

	const { token } = theme.useToken()
	const cardStyle = getSurfaceCardStyle(token)

	const focus = useViewerFocusMode()

	const { data: cytologyInfoData } = useGetCytologyInfoQuery(!!accessToken ? generalCytologyId : skipToken)

	const { data: segmentTypesData } = useGetCytologyTypesQuery(!!accessToken ? generalCytologyId : skipToken)

	const [getSegmentsByType] = useLazyGetCytologySegmentsByTypeQuery()

	const patient = cytologyInfoData?.info?.patient

	const patientFullName = useMemo(
		() =>
			[patient?.last_name, patient?.first_name, patient?.fathers_name].filter(part => part && part.trim()).join(' '),
		[patient?.last_name, patient?.first_name, patient?.fathers_name],
	)

	const markingLabel = useMemo(() => {
		const marking = cytologyInfoData?.info?.diagnostic_marking?.trim()
		const number = cytologyInfoData?.info?.diagnostic_number
		if (!marking && !number) return '—'
		return [marking, number].filter(part => part != null && part !== '').join('-')
	}, [cytologyInfoData?.info?.diagnostic_marking, cytologyInfoData?.info?.diagnostic_number])

	useEffect(() => {
		dispatch(setCytologyId(generalCytologyId))
	}, [dispatch, generalCytologyId])

	useEffect(() => {
		if (cytologyInfoData && mode === 'view') {
			dispatch(setCytologyInfo(cytologyInfoData.info))
			dispatch(setEditedCytologyInfo(null))
		}
	}, [cytologyInfoData, dispatch, mode])

	useEffect(() => {
		if (mode !== 'view') {
			return
		}

		if (!accessToken || !segmentTypesData) {
			dispatch(setInitSegments([]))
			dispatch(setSegmentsStack([]))
			return
		}

		const loadAllSegments = async () => {
			const grouped: IGroupedSegments[] = []

			for (const type of segmentTypesData as ISegmentType[]) {
				const segType = type.code as SegmentType

				try {
					const segments = await getSegmentsByType({
						id: generalCytologyId,
						segType,
					}).unwrap()

					if (!segments.length) continue

					grouped.push({
						seg_type: segType,
						segments,
					})
				} catch {
					// ignore failed type load
				}
			}

			dispatch(setInitSegments(grouped))
			dispatch(setSegmentsStack(grouped))
		}

		loadAllSegments()
	}, [dispatch, mode, accessToken, segmentTypesData, generalCytologyId, getSegmentsByType])

	const noSegmentsToShow = mode === 'view' && (!accessToken || !currentSegment)
	if (noSegmentsToShow && viewSegments.length > 0) {
		setViewSegments([])
	}

	useEffect(() => {
		if (mode !== 'view') {
			return
		}

		if (!accessToken || !currentSegment) {
			return
		}

		getSegmentsByType({ id: generalCytologyId, segType: currentSegment as SegmentType })
			.unwrap()
			.then(segments => {
				setViewSegments(segments)
			})
			.catch(() => {
				setViewSegments([])
			})
	}, [mode, accessToken, currentSegment, generalCytologyId, getSegmentsByType])

	return (
		<>
			<ViewerFocusBar focus={focus} sidebarLabel='панель заключения' style={cardStyle} />

			{focus.showOverview && (
				<Card style={{ ...cardStyle, marginTop: 16 }} styles={{ body: { padding: 12 } }}>
					<Title level={5} style={{ marginBottom: 2 }}>
						Обзор исследования
					</Title>
					<Text type='secondary' style={{ fontSize: 12 }}>
						Сводка по пациенту и диагностике
					</Text>

					<Row gutter={[12, 12]} style={{ marginTop: 8 }} align='stretch'>
						<Col xs={24} xl={12}>
							<StudyPatientCard
								fullName={patientFullName}
								policyNumber={patient?.personal_policy}
								studyDate={cytologyInfoData?.info?.diagnos_date}
							/>
						</Col>
						<Col xs={24} xl={12}>
							<Card
								title='Диагностика'
								size='small'
								style={{ ...cardStyle, height: '100%' }}
								styles={{ body: { padding: '8px 12px' } }}
							>
								<Text type='secondary'>Маркировка</Text>
								<div>
									<Text strong>{markingLabel}</Text>
								</div>
							</Card>
						</Col>
					</Row>
				</Card>
			)}

			<Row gutter={[16, 16]} align='top' style={{ marginTop: 16 }}>
				<Col xs={24} lg={focus.showSidebar ? 16 : 24}>
					<Card title='Редактор/просмотр снимка' style={cardStyle} styles={{ body: { padding: 12 } }}>
						<CytologyViewer
							isEditMode={mode === 'edit'}
							segments={
								mode === 'edit'
									? (segmentStack ?? []).flatMap(item => (item.seg_type === currentSegment ? item.segments : []))
									: viewSegments
							}
							imageUrl={cytologyInfoData?.original_image.image}
							height={focus.viewerHeight}
						/>
					</Card>
				</Col>

				{focus.showSidebar && (
					<Col xs={24} lg={8}>
						<CytologyDiagnosisPanel mode={mode} segments={segmentStack} changeMode={setMode} />
					</Col>
				)}
			</Row>
		</>
	)
}

export default CytologyView
