'use client'

import { Card, Divider, Flex, Typography } from 'antd'
import { SecurityIcon } from '@medml/ui'
import { useAuthError } from '../../contexts/AuthErrorContext'

import './AuthCard.scss'

interface AuthCardProps {
	children: React.ReactNode
}

const AuthCard = ({ children }: AuthCardProps) => {
	const { hasError } = useAuthError()

	return (
		<Card className={`auth-card ${hasError ? 'auth-card-error' : ''}`}>
			<Flex className='auth-card-content'>
				<Flex className='auth-card-form'>{children}</Flex>
				<div className='auth-card-footer-container'>
					<Divider className='auth-card-footer-divider'>Безопасный вход</Divider>
					<Flex className='auth-card-footer'>
						<SecurityIcon />
						<Typography.Text type='secondary'>Защищено 256-битным шифрованием</Typography.Text>
					</Flex>
				</div>
			</Flex>
		</Card>
	)
}

export default AuthCard
