import * as React from 'react'
import { Alert, Card, Col, Empty, Radio, Row, Space, Spin, Typography, Button } from 'antd'
import { useSearchParams } from 'react-router-dom'

import { SubscriptionInfo } from '../components/SubscriptionInfo'
import { TariffCard } from '../components/TariffCard'
import { useSubscription } from '../hooks'
import type { PaymentProvider, TariffPlan } from '../types'

const { Paragraph, Text, Title } = Typography

export interface SubscriptionPageProps {
	/**
	 * Куда возвращаться после оплаты. Передаёт приложение, потому что маршруты
	 * у УЗИ и цитологии свои. Используется только для подсказки в интерфейсе:
	 * фактический адрес возврата задаёт billing через `YOOKASSA_RETURN_URL`.
	 */
	returnHint?: string
}

/**
 * Содержимое страницы подписки, общее для всех приложений.
 *
 * Без `PageShell`: обвязку страницы даёт приложение, домен не должен знать про
 * его layout. Все ручки billing требуют авторизации, поэтому страница
 * рассчитана на использование внутри защищённого маршрута.
 */
export function SubscriptionPage({ returnHint }: SubscriptionPageProps) {
	const {
		subscription,
		tariffPlans,
		paymentProviders,
		hasActiveSubscription,
		isLoading,
		isPurchasing,
		purchaseSubscription,
		purchaseError,
	} = useSubscription()

	// SubscriptionWrapper уводит сюда с выбранным тарифом: /subscription?plan=<id>
	const [searchParams] = useSearchParams()
	const presetPlanId = searchParams.get('plan')?.trim() || undefined

	const [tariffId, setTariffId] = React.useState<string | undefined>(presetPlanId)
	const [providerId, setProviderId] = React.useState<string>()
	const [failure, setFailure] = React.useState<string>()

	// Через useMemo, иначе `?? []` создаёт новый массив на каждый рендер
	// и ломает мемоизацию всего, что от него зависит.
	const plans = React.useMemo(() => (tariffPlans ?? []) as TariffPlan[], [tariffPlans])

	const activeProviders = React.useMemo(
		() => ((paymentProviders ?? []) as PaymentProvider[]).filter(p => p.is_active),
		[paymentProviders],
	)

	// Провайдер сейчас ровно один (ЮKassa) — подставляем его сами,
	// список показываем только когда есть из чего выбирать.
	React.useEffect(() => {
		if (!providerId && activeProviders.length > 0) {
			setProviderId(activeProviders[0]?.id)
		}
	}, [activeProviders, providerId])

	const currentTariff = React.useMemo(
		() => plans.find(plan => plan.id === subscription?.tariff_plan_id),
		[plans, subscription?.tariff_plan_id],
	)

	const handlePurchase = async () => {
		if (!tariffId || !providerId) return
		setFailure(undefined)

		try {
			const { confirmation_url } = await purchaseSubscription({
				tariff_plan_id: tariffId,
				payment_provider_id: providerId,
			})

			if (!confirmation_url) {
				setFailure('Платёжная система не вернула ссылку на оплату.')
				return
			}

			window.location.assign(confirmation_url)
		} catch {
			setFailure('Не удалось создать платёж. Попробуйте ещё раз.')
		}
	}

	if (isLoading) {
		return (
			<div style={{ padding: 48, textAlign: 'center' }}>
				<Spin size='large' />
			</div>
		)
	}

	return (
		<Space direction='vertical' size='large' style={{ width: '100%' }}>
			<Card title='Текущий статус'>
				<SubscriptionInfo
					subscription={subscription ?? undefined}
					tariffPlan={currentTariff}
					isLoading={isLoading}
				/>
			</Card>

			{!hasActiveSubscription && (
				<Card title='Тарифные планы'>
					{plans.length === 0 ? (
						<Empty description='Тарифные планы недоступны' />
					) : (
						<Space direction='vertical' size='middle' style={{ width: '100%' }}>
							<Row gutter={[16, 16]}>
								{plans.map(plan => (
									<Col key={plan.id} xs={24} md={12} xl={8}>
										<TariffCard
											tariff={plan}
											isSelected={tariffId === plan.id}
											onSelect={setTariffId}
										/>
									</Col>
								))}
							</Row>

							{activeProviders.length > 1 && (
								<div>
									<Title level={5}>Способ оплаты</Title>
									<Radio.Group
										value={providerId}
										onChange={event => setProviderId(event.target.value as string)}
									>
										<Space direction='vertical'>
											{activeProviders.map(provider => (
												<Radio key={provider.id} value={provider.id}>
													{provider.name}
												</Radio>
											))}
										</Space>
									</Radio.Group>
								</div>
							)}

							{activeProviders.length === 0 && (
								<Alert
									type='warning'
									showIcon
									message='Нет доступных способов оплаты'
									description='Обратитесь к администратору: в billing не настроен активный платёжный провайдер.'
								/>
							)}

							{failure || purchaseError ? (
								<Alert type='error' showIcon message={failure ?? 'Не удалось создать платёж.'} />
							) : null}

							<Space align='center'>
								<Button
									type='primary'
									size='large'
									loading={isPurchasing}
									disabled={!tariffId || !providerId}
									onClick={() => void handlePurchase()}
								>
									Перейти к оплате
								</Button>
								{!tariffId && <Text type='secondary'>Выберите тарифный план</Text>}
							</Space>

							<Paragraph type='secondary' style={{ marginBottom: 0 }}>
								Оплата проходит на стороне ЮKassa. После оплаты вы вернётесь
								{returnHint ? ` на ${returnHint}` : ' в приложение'} — подписка
								активируется автоматически.
							</Paragraph>
						</Space>
					)}
				</Card>
			)}
		</Space>
	)
}

export default SubscriptionPage
