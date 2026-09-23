import React from 'react'
import { Button, Card, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { getAccentOutlineButtonStyle } from '@/styles/uiPatterns'

const NoImageState: React.FC = () => {
	return (
		<Card
			style={{
				minHeight: 600,
				backgroundColor: '#f5f5f5',
				borderRadius: 8,
				padding: 32,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Typography.Title level={4} style={{ margin: 0 }}>
				Изображение не загружено
			</Typography.Title>
			<Link to='/upload'>
				<Button type='default' style={getAccentOutlineButtonStyle()}>
					Загрузить изображение
				</Button>
			</Link>
		</Card>
	)
}

export default NoImageState
