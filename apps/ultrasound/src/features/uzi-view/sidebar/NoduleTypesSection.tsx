import React from 'react'
import { Card, Row, Col, Typography, theme } from 'antd'
import type { Segment } from '../model/types'
import { getSurfaceCardStyle } from '@/styles/uiPatterns'
import { formatProbability, getProbabilityValue } from '../viewer/thyroidAnnotations'

export interface NoduleTypesSectionProps {
	aiTypes: Segment[]
	doctorTypes: Segment[]
}

const { Title, Text } = Typography

const NoduleTypesSection: React.FC<NoduleTypesSectionProps> = ({
	aiTypes,
	doctorTypes,
}) => {
	const { token } = theme.useToken()

	return (
		<Card
			title='Типы новообразований'
			style={{ ...getSurfaceCardStyle(token), height: '100%' }}
			styles={{ body: { padding: 12 } }}
		>
			<div style={{ marginBottom: 8 }}>
				<Title level={5} style={{ margin: '0 0 8px 0' }}>
					Определенные системой:
				</Title>
				{aiTypes.length === 0 && <Text>Нет данных по AI-сегментам</Text>}
				{aiTypes.map((segment: Segment, index: number) => {
					const tirads2 = formatProbability(
						getProbabilityValue(segment, ['nodule_2', 'tirads_2']),
					)
					const tirads3 = formatProbability(
						getProbabilityValue(segment, ['nodule_3', 'tirads_3']),
					)
					const tirads4 = formatProbability(segment.details.nodule_4)
					const tirads5 = formatProbability(segment.details.nodule_5)

					return (
						<Row
							key={`ai-${segment.id}`}
							align='middle'
							gutter={[8, 0]}
							wrap={false}
							style={{ marginBottom: 4 }}
						>
							<Col flex='none'>
								<Text strong>Узел {index + 1}</Text>
							</Col>
							<Col flex='none'>
								<Text strong>TI-RADS {segment.details.nodule_type}</Text>
							</Col>
							<Col flex='auto'>
								<Text>
									(TI-RADS 2: {tirads2}, TI-RADS 3: {tirads3}, TI-RADS 4:{' '}
									{tirads4}, TI-RADS 5: {tirads5})
								</Text>
							</Col>
						</Row>
					)
				})}
			</div>

			<div>
				<Title level={5} style={{ margin: '0 0 8px 0' }}>
					Определенные специалистом:
				</Title>
				{doctorTypes.length === 0 && (
					<Text>Нет пользовательских сегментов</Text>
				)}
				{doctorTypes.map((segment: Segment, index: number) => (
					<Row
						key={`doc-${segment.id}`}
						align='middle'
						gutter={[8, 0]}
						wrap={false}
						style={{ marginBottom: 4 }}
					>
						<Col flex='none'>
							<Text strong>Узел {index + 1}</Text>
						</Col>
						<Col flex='none'>
							<Text strong>TI-RADS {segment.details.nodule_type}</Text>
						</Col>
						<Col flex='auto'>
							<Text>(подтверждено специалистом)</Text>
						</Col>
					</Row>
				))}
			</div>
		</Card>
	)
}

export default NoduleTypesSection
