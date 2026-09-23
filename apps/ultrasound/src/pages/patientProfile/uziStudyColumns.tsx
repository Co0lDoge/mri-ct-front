import * as React from 'react'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { uziStudyStatusTagColor, type PatientUziStudyRow } from '@/api/patientProfileApi'

const Dash: React.FC = () => (
	<Typography.Text type='secondary' style={{ fontSize: 13 }}>
		—
	</Typography.Text>
)

export function useUziStudyColumns(deviceMap: Map<string, string>): ColumnsType<PatientUziStudyRow> {
	return React.useMemo(
		() => [
			{
				title: 'Дата',
				dataIndex: 'createdAtLabel',
				key: 'createdAtLabel',
				width: '14%',
				ellipsis: { showTitle: true },
			},
			{
				title: 'Статус',
				key: 'status',
				width: '16%',
				render: (_: unknown, row: PatientUziStudyRow) => {
					if (!row.statusRaw) return <Dash />
					return (
						<Tag color={uziStudyStatusTagColor(row.statusRaw)} style={{ margin: 0 }}>
							{row.statusLabel}
						</Tag>
					)
				},
			},
			{
				title: 'Проекция',
				dataIndex: 'projectionLabel',
				key: 'projectionLabel',
				width: '16%',
				ellipsis: { showTitle: true },
			},
			{
				title: 'Проверен',
				key: 'checkedLabel',
				width: '16%',
				align: 'center' as const,
				render: (_: unknown, row: PatientUziStudyRow) => {
					const label = row.checkedLabel
					if (label === '—' || !label) return <Dash />
					if (label === 'Да') {
						return (
							<Tag color='success' icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
								Да
							</Tag>
						)
					}
					return (
						<Tag color='default' style={{ margin: 0 }}>
							Нет
						</Tag>
					)
				},
			},
			{
				title: 'Аппарат',
				key: 'device',
				width: '28%',
				ellipsis: { showTitle: true },
				render: (_: unknown, row: PatientUziStudyRow) => {
					if (!row.deviceIdRaw) return <Dash />
					const text = deviceMap.get(row.deviceIdRaw) ?? `№ ${row.deviceIdRaw}`
					return <Typography.Text ellipsis={{ tooltip: text }}>{text}</Typography.Text>
				},
			},
			{
				title: '',
				key: 'open',
				width: '16%',
				align: 'center' as const,
				render: (_: unknown, row: PatientUziStudyRow) => {
					if (!row.key) return <Dash />
					return (
						<Link to={`/uzi_view/${encodeURIComponent(row.key)}`} style={{ color: 'var(--ant-color-link, #1677ff)' }}>
							Открыть
						</Link>
					)
				},
			},
		],
		[deviceMap],
	)
}
