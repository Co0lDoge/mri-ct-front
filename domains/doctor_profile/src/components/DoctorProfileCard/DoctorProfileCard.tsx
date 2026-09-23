'use client'

import './DoctorProfileCard.scss'

import { Button, Card, Skeleton, Space, Tag } from 'antd'
import { BellOutlined, EditOutlined } from '@ant-design/icons'

import type { DoctorProfileViewModel } from '../../types'

export type DoctorProfileCardProps = {
	profile?: DoctorProfileViewModel | null
	loading?: boolean
	unreadCount?: number
	onOpenNotifications?: () => void
	showNotifications?: boolean
	onEditProfile?: () => void
	className?: string
}

export function DoctorProfileCard({
	profile,
	loading,
	unreadCount = 0,
	onOpenNotifications,
	showNotifications = true,
	onEditProfile,
	className,
}: DoctorProfileCardProps) {
	if (loading || !profile) {
		return (
			<Card className={['doctor-profile', className].filter(Boolean).join(' ')}>
				<Skeleton active avatar paragraph={{ rows: 1 }} title={{ width: 280 }} />
			</Card>
		)
	}

	return (
		<Card className={['doctor-profile', className].filter(Boolean).join(' ')}>
			<div className='doctor-profile__row'>
				<div className='doctor-profile__identity'>
					<span className='doctor-profile__avatar' aria-hidden='true'>
						{profile.initials}
					</span>

					<div className='doctor-profile__info'>
						<h2 className='doctor-profile__name'>{profile.fullName}</h2>

						<div className='doctor-profile__chips'>
							{profile.speciality && <Tag>{profile.speciality}</Tag>}
							{profile.organization && <Tag>{profile.organization}</Tag>}
							{profile.isRemoteWorker && <Tag color='cyan'>Удалённая работа</Tag>}
						</div>
					</div>
				</div>

				<Space size={12}>
					{onEditProfile ? (
						<Button icon={<EditOutlined />} onClick={onEditProfile}>
							Редактировать профиль
						</Button>
					) : null}

					{showNotifications && (
						<Button icon={<BellOutlined />} onClick={onOpenNotifications}>
							Уведомления
							{unreadCount > 0 && <span className='doctor-profile__badge'>{unreadCount}</span>}
						</Button>
					)}
				</Space>
			</div>
		</Card>
	)
}
