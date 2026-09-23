import { Card } from 'antd'
import { PageShell } from '@medml/layout'
import { CytologyStudyFaq } from '@/components/CytologyStudyFaq'

export default function FaqRoute() {
	return (
		<PageShell
			eyebrow='Инструкция'
			title='Как использовать ассистента?'
			subtitle='Типовые сценарии — от регистрации до разметки цитологического снимка.'
		>
			<Card styles={{ body: { padding: 24 } }}>
				<CytologyStudyFaq />
			</Card>
		</PageShell>
	)
}
