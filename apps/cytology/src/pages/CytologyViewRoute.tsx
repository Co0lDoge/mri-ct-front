import { Link, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import { PageShell } from '@medml/layout'
import CytologyViewPage from '@/features/cytology-view/CytologyViewPage'

export default function CytologyViewRoute() {
	const { id } = useParams<{ id: string }>()

	if (!id?.trim()) {
		return (
			<PageShell>
				<Typography.Text type='danger'>Не указан идентификатор цитологического снимка.</Typography.Text>
			</PageShell>
		)
	}

	return (
		<PageShell
			eyebrow='Результат диагностики'
			title='Снимок цитологии'
			actions={
				<Link to='/patients'>
					<Button icon={<ArrowLeftOutlined />}>К списку пациентов</Button>
				</Link>
			}
		>
			<CytologyViewPage />
		</PageShell>
	)
}
