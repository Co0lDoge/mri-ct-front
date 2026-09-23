import React, { useMemo } from 'react'
import { Card, Col, Form, Grid, Row, Spin, Typography, theme } from 'antd'
import { useViewerFocusMode, ViewerFocusBar } from '@medml/viewers'

import { useGetThyroidUziDataQuery, useGetUziDevicesQuery } from '@/api/uziApi'
import { getSurfaceCardStyle } from '@/styles/uiPatterns'

import { Gallery } from './gallery'
import { ActionButtons, NoduleTypesSection, PatientInfoSection, StudyDataSection } from './sidebar'
import { useThyroidSegmentEditor, useThyroidStudyForm } from './model'
import type { Segment } from './model/types'

export interface UziViewPageProps {
	uziId: string
}

/**
 * Страница просмотра/редактирования снимка УЗИ ЩЖ — композиция и разметка.
 * Данные и мутации живут в `model/`, аннотирование — в `viewer/`.
 */
const UziViewPage: React.FC<UziViewPageProps> = ({ uziId }) => {
	const { token } = theme.useToken()
	const screens = Grid.useBreakpoint()

	const { data, isLoading, error } = useGetThyroidUziDataQuery(uziId)
	const { data: devicesData } = useGetUziDevicesQuery()

	const devices = useMemo(() => (devicesData || []).map(d => ({ id: Number(d.id), name: d.name })), [devicesData])

	// Сегментация приходит с сервера; после мутаций RTK Query перечитывает
	// снимок сам (invalidatesTags), поэтому локального состояния тут нет.
	const editor = useThyroidSegmentEditor({
		uziId,
		serverSegmentation: data?.segmentation,
	})

	const studyForm = useThyroidStudyForm({ uziId, data, devices })

	const focus = useViewerFocusMode()

	const { aiTypes, doctorTypes } = useMemo(() => {
		const segmentation = data?.segmentation || []
		return {
			aiTypes: segmentation.filter((s: Segment) => s.is_ai === true),
			doctorTypes: segmentation.filter((s: Segment) => s.is_ai === false),
		}
	}, [data])

	if (isLoading) {
		return (
			<div style={{ padding: '40px', textAlign: 'center' }}>
				<Spin size='large' tip='Загрузка данных...' />
			</div>
		)
	}

	if (error || !data) {
		const errorMessage = error
			? typeof error === 'object' && 'status' in error
				? `Ошибка ${error.status}`
				: 'Ошибка загрузки данных'
			: 'Не удалось загрузить данные'

		return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{errorMessage}</div>
	}

	const { patient } = data.info
	const { Title, Text } = Typography
	const cardStyle = getSurfaceCardStyle(token)

	// Ширину колонки и внешние отступы задаёт PageShell в UziViewRoute.
	return (
		<>
			<ViewerFocusBar focus={focus} style={cardStyle} />

			{focus.showOverview && (
				<Card style={cardStyle} styles={{ body: { padding: 16 } }}>
					<Title level={4} style={{ marginBottom: 4 }}>
						Основная информация
					</Title>
					<Text type='secondary'>Сводка по пациенту и диагностике</Text>

					<Row gutter={[12, 12]} style={{ marginTop: 8 }} align='stretch'>
						<Col xs={24} xl={12}>
							<PatientInfoSection patient={patient} date={data.info.diagnos_date} />
						</Col>
						<Col xs={24} xl={12}>
							<NoduleTypesSection aiTypes={aiTypes} doctorTypes={doctorTypes} />
						</Col>
					</Row>
				</Card>
			)}

			<Row gutter={[16, 16]} align='top'>
				<Col xs={24} lg={focus.showSidebar ? 16 : 24}>
					<Card title='Редактор/просмотр изображения' style={cardStyle} styles={{ body: { padding: 12 } }}>
						<Gallery
							link1={data.image.image}
							image_count={data.info.image_count ?? 1}
							slide_template={data.image.slide_template}
							slide_urls={data.image.slide_urls}
							seg={editor.displaySegmentation}
							imageid={data.image.id}
							isEditMode={editor.isEditMode}
							onStartEdit={editor.startEdit}
							onSaveEdit={editor.saveSegments}
							onCancelEdit={editor.cancelEdit}
							isSaving={editor.isSaving}
							hasUnsavedChanges={editor.hasUnsavedChanges}
							onDraftChangesChange={editor.setPendingChanges}
							viewerResetKey={editor.viewerResetKey}
							viewerHeight={focus.viewerHeight}
						/>
					</Card>
				</Col>

				{focus.showSidebar && (
					<Col xs={24} lg={8}>
						<div
							style={{
								position: screens.lg ? 'sticky' : 'static',
								top: screens.lg ? 12 : 0,
								display: 'flex',
								flexDirection: 'column',
								gap: 12,
								maxHeight: screens.lg ? 'calc(100vh - 96px)' : 'none',
								overflow: screens.lg ? 'auto' : 'visible',
								paddingRight: 2,
							}}
						>
							<Form form={studyForm.form} layout='vertical'>
								<StudyDataSection
									form={studyForm.form}
									devices={devices}
									modalVisible={studyForm.modalVisible}
									setModalVisible={studyForm.setModalVisible}
									onSave={studyForm.handleSave}
									saving={studyForm.saving}
								/>

								<Card size='small' style={cardStyle} styles={{ body: { padding: 12 } }}>
									<ActionButtons onSave={studyForm.handleSave} />
								</Card>
							</Form>
						</div>
					</Col>
				)}
			</Row>
		</>
	)
}

export default UziViewPage
