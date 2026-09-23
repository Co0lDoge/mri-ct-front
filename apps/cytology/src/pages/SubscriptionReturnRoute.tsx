import * as React from 'react'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Button, Card, Result, Space, Spin, Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

import { PageShell } from '@medml/layout'
import { useLazyCheckActiveSubscriptionQuery } from '@medml/store'

const { Paragraph } = Typography

/** Сколько раз опрашиваем статус и с каким интервалом. */
const ATTEMPTS = 20
const INTERVAL_MS = 3000

/**
 * Возврат из ЮKassa (`/subscription/return`).
 *
 * Подписку активирует вебхук на стороне billing, а не редирект. Поэтому в
 * момент возврата она может быть ещё не активна: опрашиваем `check-active`
 * до успеха или до исчерпания попыток.
 */
export default function SubscriptionReturnRoute() {
	const navigate = useNavigate()
	const [checkActive] = useLazyCheckActiveSubscriptionQuery()

	const [state, setState] = React.useState<'polling' | 'active' | 'timeout'>('polling')
	const [attempt, setAttempt] = React.useState(0)

	React.useEffect(() => {
		let cancelled = false
		let timer: ReturnType<typeof setTimeout>

		const poll = async (n: number) => {
			if (cancelled) return

			setAttempt(n)

			try {
				const result = await checkActive().unwrap()
				if (cancelled) return

				if (result.has_active_subscription) {
					setState('active')
					return
				}
			} catch {
				// Сетевая ошибка на одной попытке — не повод сдаваться.
			}

			if (n >= ATTEMPTS) {
				setState('timeout')
				return
			}

			timer = setTimeout(() => void poll(n + 1), INTERVAL_MS)
		}

		void poll(1)

		return () => {
			cancelled = true
			clearTimeout(timer)
		}
	}, [checkActive])

	if (state === 'active') {
		return (
			<PageShell title='Оплата'>
				<Result
					status='success'
					icon={<CheckCircleOutlined />}
					title='Подписка активна'
					subTitle='Доступ к обработке снимков открыт.'
					extra={[
						<Button type='primary' key='patients' onClick={() => navigate('/patients')}>
							К списку пациентов
						</Button>,
						<Link key='subscription' to='/subscription'>
							<Button>Детали подписки</Button>
						</Link>,
					]}
				/>
			</PageShell>
		)
	}

	if (state === 'timeout') {
		return (
			<PageShell title='Оплата'>
				<Result
					status='info'
					icon={<ClockCircleOutlined />}
					title='Платёж ещё обрабатывается'
					subTitle='Это нормально: подтверждение от платёжной системы может занять несколько минут.'
					extra={
						<Link to='/subscription'>
							<Button type='primary'>Проверить статус</Button>
						</Link>
					}
				/>
			</PageShell>
		)
	}

	return (
		<PageShell title='Оплата'>
			<Card>
				<Space direction='vertical' align='center' style={{ width: '100%', padding: 32 }}>
					<Spin size='large' />
					<Paragraph style={{ marginBottom: 0 }}>
						Проверяем оплату… попытка {attempt} из {ATTEMPTS}
					</Paragraph>
					<Paragraph type='secondary' style={{ marginBottom: 0 }}>
						Не закрывайте страницу.
					</Paragraph>
				</Space>
			</Card>
		</PageShell>
	)
}
