import React from 'react'
import { Button, Card, Space, Typography } from 'antd'

import type { ViewerFocusMode } from './useViewerFocusMode'

const { Title, Text } = Typography

export interface ViewerFocusBarProps {
	focus: ViewerFocusMode
	/** Как называется боковая панель в подписи кнопки. */
	sidebarLabel?: string
	title?: string
	description?: string
	/** Оформление карточки задаёт приложение — у каждого своя тема. */
	style?: React.CSSProperties
}

/**
 * Панель управления режимом просмотра: скрыть сводку, скрыть боковую панель,
 * либо убрать всё разом и оставить один снимок.
 */
const ViewerFocusBar: React.FC<ViewerFocusBarProps> = ({
	focus,
	sidebarLabel = 'правую панель',
	title = 'Режим просмотра',
	description = 'Можно скрыть соседние блоки и увеличить область снимка',
	style,
}) => {
	return (
		<Card style={style} styles={{ body: { padding: 12 } }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 12,
					flexWrap: 'wrap',
				}}
			>
				<div>
					<Title level={5} style={{ margin: 0 }}>
						{title}
					</Title>
					<Text type='secondary'>{description}</Text>
				</div>
				<Space wrap>
					<Button onClick={() => focus.setShowOverview(prev => !prev)}>
						{focus.showOverview ? 'Скрыть сводку' : 'Показать сводку'}
					</Button>
					<Button onClick={() => focus.setShowSidebar(prev => !prev)}>
						{focus.showSidebar ? `Скрыть ${sidebarLabel}` : `Показать ${sidebarLabel}`}
					</Button>
					<Button type={focus.isViewerFocused ? 'default' : 'primary'} onClick={focus.toggleFocus}>
						{focus.isViewerFocused ? 'Обычный режим' : 'Фокус на снимке'}
					</Button>
				</Space>
			</div>
		</Card>
	)
}

export default ViewerFocusBar
