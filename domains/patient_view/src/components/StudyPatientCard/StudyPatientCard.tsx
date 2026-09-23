import { Card, Descriptions, Typography, theme } from 'antd'

import { formatDate } from '@medml/shared'
import { getSurfaceCardStyle } from '@medml/ui'

const { Text } = Typography

export type StudyPatientCardProps = {
	fullName?: string
	policyNumber?: string
	studyDate?: string
	title?: string
}

const DASH = '—'

function nonEmpty(value: string | undefined): string {
	const trimmed = value?.trim()
	return trimmed ? trimmed : DASH
}

export function StudyPatientCard({
	fullName,
	policyNumber,
	studyDate,
	title = 'Данные пациента',
}: StudyPatientCardProps) {
	const { token } = theme.useToken()

	const dateLabel = studyDate?.trim() ? formatDate(studyDate) : DASH

	return (
		<Card
			title={title}
			size='small'
			style={{ ...getSurfaceCardStyle(token), height: '100%' }}
			styles={{ body: { padding: '8px 12px' } }}
		>
			<Descriptions column={1} size='small' colon={false} styles={{ label: { width: 120 } }}>
				<Descriptions.Item label='Пациент'>
					<Text strong>{nonEmpty(fullName)}</Text>
				</Descriptions.Item>
				<Descriptions.Item label='Полис'>
					<Text strong>{nonEmpty(policyNumber)}</Text>
				</Descriptions.Item>
				<Descriptions.Item label='Дата исследования'>
					<Text strong>{nonEmpty(dateLabel)}</Text>
				</Descriptions.Item>
			</Descriptions>
		</Card>
	)
}

export default StudyPatientCard
