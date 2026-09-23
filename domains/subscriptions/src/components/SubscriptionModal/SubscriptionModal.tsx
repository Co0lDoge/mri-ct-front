import React, { useEffect, useState } from 'react'
import { Modal, Button, Radio, Space, Typography, Spin, Alert, message } from 'antd'
import { useAppDispatch, useAppSelector } from '@medml/store'
import { closeModal, setModalStep } from '@medml/store'
import type { TariffPlan, PaymentProvider, SubscriptionPurchaseRequest } from '../../types'
import { TariffCard } from '../TariffCard'
import styles from './SubscriptionModal.module.scss'

const { Text, Title } = Typography

export type SubscriptionModalStep = 'tariff' | 'payment' | 'waiting'

export interface SubscriptionModalProps {
	onPurchase: (data: SubscriptionPurchaseRequest) => Promise<{ confirmation_url: string }>
	onSubscriptionComplete?: () => void
	checkSubscriptionStatus: () => Promise<boolean>
	tariffPlans?: TariffPlan[]
	paymentProviders?: PaymentProvider[]
	isLoading?: boolean
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
	onPurchase,
	onSubscriptionComplete,
	checkSubscriptionStatus,
	tariffPlans = [],
	paymentProviders = [],
	isLoading = false,
}) => {
	const dispatch = useAppDispatch()
	const { isModalOpen, modalStep } = useAppSelector(state => state.subscription)

	const [selectedTariff, setSelectedTariff] = useState<string>()
	const [selectedProvider, setSelectedProvider] = useState<string>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isChecking, setIsChecking] = useState(false)

	useEffect(() => {
		if (!isModalOpen) {
			setSelectedTariff(undefined)
			setSelectedProvider(undefined)
		}
	}, [isModalOpen])

	const runStatusCheck = async (): Promise<boolean> => {
		setIsChecking(true)
		try {
			return await checkSubscriptionStatus()
		} finally {
			setIsChecking(false)
		}
	}

	useEffect(() => {
		if (modalStep !== 'waiting' || !isModalOpen) return

		const tick = async () => {
			const isActive = await runStatusCheck()
			if (isActive) {
				onSubscriptionComplete?.()
				dispatch(closeModal())
			}
		}

		void tick()
		const interval = setInterval(() => void tick(), 3000)
		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStep, isModalOpen])

	const handleClose = () => {
		dispatch(closeModal())
	}

	const handleSubscribe = async () => {
		if (!selectedTariff || !selectedProvider) return
		try {
			setIsSubmitting(true)
			const response = await onPurchase({
				tariff_plan_id: selectedTariff,
				payment_provider_id: selectedProvider,
			})
			if (response?.confirmation_url) {
				window.open(response.confirmation_url, '_blank')
				dispatch(setModalStep('waiting'))
			}
		} catch {
			message.error('Не удалось оформить подписку')
		} finally {
			setIsSubmitting(false)
		}
	}

	const activeProviders = paymentProviders.filter(p => p.is_active)

	return (
		<Modal
			open={isModalOpen}
			onCancel={handleClose}
			footer={null}
			width={800}
			className={styles.modal}
			title='Оформление подписки'
		>
			{modalStep === 'tariff' && (
				<>
					<Title level={4}>Выберите тариф</Title>
					<div className={styles.tariffCards}>
						{tariffPlans.map(plan => (
							<TariffCard
								key={plan.id}
								tariff={plan}
								isSelected={selectedTariff === plan.id}
								onSelect={setSelectedTariff}
							/>
						))}
					</div>
					<div className={styles.footer}>
						<Button
							type='primary'
							disabled={!selectedTariff}
							loading={isLoading}
							onClick={() => dispatch(setModalStep('payment'))}
						>
							Продолжить
						</Button>
					</div>
				</>
			)}

			{modalStep === 'payment' && (
				<>
					<Title level={4}>Способ оплаты</Title>
					<Radio.Group onChange={e => setSelectedProvider(e.target.value)} value={selectedProvider}>
						<Space direction='vertical'>
							{activeProviders.map(provider => (
								<Radio key={provider.id} value={provider.id}>
									{provider.name}
								</Radio>
							))}
						</Space>
					</Radio.Group>
					<div className={styles.footer}>
						<Button onClick={() => dispatch(setModalStep('tariff'))}>Назад</Button>
						<Button type='primary' disabled={!selectedProvider} loading={isSubmitting} onClick={handleSubscribe}>
							Оформить подписку
						</Button>
					</div>
				</>
			)}

			{modalStep === 'waiting' && (
				<div className={styles.waitingContainer}>
					<Spin size='large' />
					<Title level={4}>Ожидание оплаты</Title>
					<Text>Завершите оплату в окне YooKassa. Мы проверяем статус на сервере каждые 3 секунды.</Text>
					<Alert
						type='warning'
						showIcon
						message='Оплатили, но окно не закрылось?'
						description='Подтверждение приходит с сервера. Нажмите «Проверить сейчас» или закройте это окно и «Обновить» на странице подписки.'
					/>
					<Space>
						<Button
							type='primary'
							loading={isChecking}
							onClick={async () => {
								const isActive = await runStatusCheck()
								if (isActive) {
									onSubscriptionComplete?.()
									dispatch(closeModal())
								} else {
									message.warning('Сервер ещё не видит активную подписку. Подождите или обновите страницу позже.')
								}
							}}
						>
							Проверить сейчас
						</Button>
						<Button onClick={handleClose}>Закрыть</Button>
					</Space>
				</div>
			)}
		</Modal>
	)
}
