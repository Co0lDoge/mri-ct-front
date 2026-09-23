import { ReloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'

import { PageShell } from '@medml/layout'
import { SubscriptionPage, useSubscription } from '@medml/subscriptions'

/**
 * Подписка врача (`/subscription`).
 *
 * Тонкая обёртка: обвязка страницы здесь, содержимое — в домене
 * `@medml/subscriptions`, общее с УЗИ.
 */
export default function SubscriptionRoute() {
	const { refetchStatus } = useSubscription()

	return (
		<PageShell
			eyebrow='Аккаунт'
			title='Подписка'
			subtitle='Доступ к обработке снимков предоставляется по подписке.'
			actions={
				<Button icon={<ReloadOutlined />} onClick={refetchStatus}>
					Обновить
				</Button>
			}
		>
			<SubscriptionPage returnHint='страницу оплаты' />
		</PageShell>
	)
}
