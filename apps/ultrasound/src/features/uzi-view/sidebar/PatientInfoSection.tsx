import React from 'react'
import { Card, Descriptions, Typography, theme } from 'antd'
import { formatDate } from '@medml/shared'
import type { PatientInfo } from '../model/types'
import { getSurfaceCardStyle } from '@/styles/uiPatterns'

export interface PatientInfoSectionProps {
	patient: PatientInfo
	date: string
}

const { Text } = Typography

const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({
	patient,
	date,
}) => {
	const { token } = theme.useToken()

	return (
		<Card
			title='Данные пациента'
			style={{ ...getSurfaceCardStyle(token), height: '100%' }}
			styles={{ body: { padding: 12 } }}
		>
			<Descriptions column={1} size='small'>
				<Descriptions.Item label='Пациент'>
					<Text strong>
						{patient.last_name} {patient.first_name} {patient.fathers_name}
					</Text>
				</Descriptions.Item>
				<Descriptions.Item label='Полис'>
					<Text strong>{patient.personal_policy}</Text>
				</Descriptions.Item>
				<Descriptions.Item label='Дата исследования'>
					<Text strong>{formatDate(date)}</Text>
				</Descriptions.Item>
			</Descriptions>
		</Card>
	)
}

export default PatientInfoSection
