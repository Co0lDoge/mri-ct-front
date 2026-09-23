import React from 'react'

export type ViewerPanelPosition =
	| 'toolbar'
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'bottom-bar'

export interface ViewerPanelProps {
	/** Готовая позиция панели поверх холста. */
	position?: ViewerPanelPosition
	minWidth?: number | string
	/** Если задано — панель скроллится по вертикали при переполнении. */
	maxHeight?: number | string
	className?: string
	style?: React.CSSProperties
	children: React.ReactNode
}

const POSITION_STYLE: Record<ViewerPanelPosition, React.CSSProperties> = {
	toolbar: {
		position: 'absolute',
		top: '50%',
		right: 10,
		transform: 'translateY(-50%)',
	},
	'top-left': { position: 'absolute', top: 20, left: 20 },
	'top-right': { position: 'absolute', top: 20, right: 20 },
	'bottom-left': { position: 'absolute', bottom: 20, left: 20 },
	'bottom-right': { position: 'absolute', bottom: 20, right: 20 },
	/**
	 * Горизонтальная лента внизу — вариант тулбара для узких экранов.
	 * Вертикальная панель справа на телефоне закрывала бы сам снимок.
	 */
	'bottom-bar': {
		position: 'absolute',
		left: 8,
		right: 8,
		bottom: 8,
	},
}

/**
 * Общая "стеклянная" панель поверх холста вьюера — единственный источник
 * визуального языка (фон/скругления/тень) для встроенного тулбара
 * (`ViewerContainer`) и доменных оверлеев, подключаемых через
 * `overlaySlot` / `customToolbarSlot` (легенды, подсказки, переключатели).
 *
 * Вынесена, чтобы приложения (apps/ultrasound и т.д.) не копировали
 * инлайн-стили панели у себя, а переиспользовали готовый примитив.
 */
const ViewerPanel: React.FC<ViewerPanelProps> = ({
	position = 'top-left',
	minWidth = 120,
	maxHeight,
	className,
	style,
	children,
}) => (
	<div
		className={['medml-viewer-panel', className].filter(Boolean).join(' ')}
		style={{
			...POSITION_STYLE[position],
			zIndex: 1000,
			display: 'flex',
			// Нижняя лента раскладывает содержимое в строку с переносом.
			flexDirection: position === 'bottom-bar' ? 'row' : 'column',
			flexWrap: position === 'bottom-bar' ? 'wrap' : 'nowrap',
			alignItems: 'center',
			justifyContent: position === 'bottom-bar' ? 'center' : undefined,
			gap: 8,
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			padding: '12px 8px',
			borderRadius: 12,
			boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			border: '1px solid rgba(0,0,0,0.1)',
			minWidth,
			...(maxHeight ? { maxHeight, overflowY: 'auto' as const } : null),
			...style,
		}}
	>
		{children}
	</div>
)

export default ViewerPanel
