import React from 'react'
import { ViewerActionButton } from '@medml/viewers'

export interface SegmentsVisibilityToggleProps {
	visible: boolean
	onToggle: () => void
}

/**
 * Кнопка показать/скрыть сегменты в кастомном слоте тулбара. Чисто
 * презентационный компонент — использует `ViewerActionButton` из
 * `@medml/viewers` вместо копирования стилей кнопки.
 */
const SegmentsVisibilityToggle: React.FC<SegmentsVisibilityToggleProps> = ({
	visible,
	onToggle,
}) => (
	<div
		style={{
			display: 'flex',
			flexDirection: 'column',
			gap: 4,
			alignItems: 'center',
		}}
	>
		<ViewerActionButton tone={visible ? 'green' : 'red'} compact onClick={onToggle}>
			{visible ? 'Скрыть' : 'Показать'}
		</ViewerActionButton>
		<div style={{ fontSize: 15, color: visible ? '#4CAF50' : '#f44336' }}>
			{visible ? 'ВКЛ' : 'ВЫКЛ'}
		</div>
	</div>
)

export default SegmentsVisibilityToggle
