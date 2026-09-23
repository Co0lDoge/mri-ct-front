'use client'

import React from 'react'
import { Button, Space, Spin } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

import { useSubscription } from '../../hooks'
import type { TariffPlan } from '../../types'
import styles from './SubscriptionWrapper.module.scss'

export interface SubscriptionWrapperProps {
	children: React.ReactNode
	subscribePath?: string
}

/**
 * Обёртка для страниц, требующих активной подписки.
 *
 * СЕЙЧАС НИГДЕ НЕ ПОДКЛЮЧЕНА.
 */
export const SubscriptionWrapper: React.FC<SubscriptionWrapperProps> = ({
	children,
	subscribePath = '/subscription',
}) => {
	const navigate = useNavigate()
	const { hasActiveSubscription, isLoading, tariffPlans } = useSubscription()

	if (isLoading) {
		return (
			<div className={styles.loading}>
				<Spin size='large' />
			</div>
		)
	}

	if (hasActiveSubscription) {
		return <>{children}</>
	}

	const goToSubscribe = (planId?: string) => {
		navigate(planId ? `${subscribePath}?plan=${encodeURIComponent(planId)}` : subscribePath)
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.overlay}>
				<div className={styles.content}>
					<LockOutlined className={styles.icon} />
					<h2>Требуется активная подписка</h2>
					<p>
						Для доступа к этому разделу необходимо оформить подписку. Выберите подходящий тарифный план и начните
						пользоваться всеми функциями.
					</p>

					{(tariffPlans ?? []).length > 0 && (
						<div className={styles.plans}>
							{((tariffPlans ?? []) as TariffPlan[]).slice(0, 3).map(plan => (
								<div key={plan.id} className={styles.plan}>
									<h3>{plan.name}</h3>
									<p>{plan.description}</p>
									<Button type='primary' size='small' onClick={() => goToSubscribe(plan.id)}>
										Выбрать
									</Button>
								</div>
							))}
						</div>
					)}

					<Space>
						<Button onClick={() => navigate(-1)}>Назад</Button>
						<Button type='primary' size='large' onClick={() => goToSubscribe()}>
							Оформить подписку
						</Button>
					</Space>
				</div>
			</div>
			<div className={styles.pageContent}>{children}</div>
		</div>
	)
}
