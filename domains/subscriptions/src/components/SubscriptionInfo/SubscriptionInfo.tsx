import React from 'react'
import { Alert, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Subscription, TariffPlan } from '../../types'
import { durationToDays, formatPrice } from '../../utils/formatPrice'

export interface SubscriptionInfoProps {
	subscription?: Subscription
	tariffPlan?: TariffPlan
	onSubscribe?: () => void
	isLoading?: boolean
}

export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
	subscription,
	tariffPlan,
	onSubscribe,
	isLoading = false,
}) => {
	if (!subscription) {
		return (
			<Alert
				message='Нет активной подписки'
				description={
					onSubscribe ? (
						<Button
							type='primary'
							icon={<PlusOutlined />}
							onClick={onSubscribe}
							loading={isLoading}
						>
							Оформить подписку
						</Button>
					) : null
				}
				type='warning'
				showIcon
			/>
		)
	}

	if (!tariffPlan) {
		return (
			<Alert
				message='Активная подписка'
				description={`Действует до ${dayjs(subscription.end_date).format('DD.MM.YYYY')}`}
				type='success'
				showIcon
			/>
		)
	}

	const daysLeft = dayjs(subscription.end_date).diff(dayjs(), 'day')
	const durationDays = durationToDays(tariffPlan.duration)

	return (
		<Alert
			message='Активная подписка'
			description={
				<div>
					<p>Тариф: {tariffPlan.name}</p>
					<p>{tariffPlan.description}</p>
					<p>
						Стоимость: {formatPrice(tariffPlan.price)} / {durationDays} дн.
					</p>
					<p>
						Действует до: {dayjs(subscription.end_date).format('DD.MM.YYYY')}{' '}
						(осталось {Math.max(0, daysLeft)} дн.)
					</p>
				</div>
			}
			type='success'
			showIcon
		/>
	)
}
