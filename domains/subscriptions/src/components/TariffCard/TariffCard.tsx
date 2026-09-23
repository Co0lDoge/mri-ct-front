import React from 'react'
import { Card, Typography } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import type { TariffPlan } from '../../types'
import { durationToDays, formatPrice } from '../../utils/formatPrice'
import styles from './TariffCard.module.scss'

const { Text, Title } = Typography

export interface TariffCardProps {
	tariff: TariffPlan
	isSelected?: boolean
	onSelect?: (tariffId: string) => void
}

export const TariffCard: React.FC<TariffCardProps> = ({
	tariff,
	isSelected = false,
	onSelect,
}) => {
	const durationDays = durationToDays(tariff.duration)

	return (
		<Card
			className={`${styles.card} ${isSelected ? styles.selected : ''}`}
			onClick={() => onSelect?.(tariff.id)}
		>
			<div className={styles.header}>
				<Title level={5}>{tariff.name}</Title>
			</div>
			<Text className={styles.description}>{tariff.description}</Text>
			<div className={styles.pricing}>
				<Text strong>{formatPrice(tariff.price)}</Text>
				<Text type='secondary'> / {durationDays} дн.</Text>
			</div>
			{isSelected && (
				<div className={styles.selection}>
					<CheckOutlined />
				</div>
			)}
		</Card>
	)
}
