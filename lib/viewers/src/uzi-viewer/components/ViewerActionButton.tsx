import React from 'react'

export type ViewerActionButtonTone =
	| 'blue'
	| 'orange'
	| 'purple'
	| 'green'
	| 'red'
	| 'gray'

export interface ViewerActionButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	tone?: ViewerActionButtonTone
	/** Компактный вариант (меньший шрифт/паддинги) — для текстовых кнопок вроде "Fit". */
	compact?: boolean
}

/**
 * Палитра кнопок вьюера.
 *
 * Значения повторяют токены дизайн-системы (`@medml/ui/theme/tokens`), но
 * заданы здесь литералами намеренно: по правилам зависимостей
 * (docs/architecture/dependency-rules.md) пакет визуализации не тянет
 * `@medml/ui`. При изменении палитры в дизайн-системе обновить и здесь.
 *
 * Раньше тут была Material-палитра (#2196F3 / #FF9800 / #9C27B0 …),
 * не совпадавшая ни с макетом, ни с темой antd.
 */
const TONE_COLORS: Record<ViewerActionButtonTone, string> = {
	/** cyan — основное действие вьюера. */
	blue: '#06B6D4',
	/** blue — вторичный акцент. */
	orange: '#3B82F6',
	/** navy — нейтральное действие на светлой панели. */
	purple: '#334155',
	green: '#10B981',
	red: '#E11D48',
	gray: '#64748B',
}

/**
 * Единый стиль кнопок вьюера: используется встроенным тулбаром
 * (zoom/fit/rotate/tools) и доменными кнопками в `customToolbarSlot`
 * (например, переключатель видимости сегментов в apps/ultrasound).
 *
 * Вынесена как переиспользуемый примитив, чтобы приложения не
 * копировали paddings/borderRadius/boxShadow кнопок вручную.
 */
const ViewerActionButton: React.FC<ViewerActionButtonProps> = ({
	tone = 'gray',
	compact = false,
	style,
	disabled,
	children,
	...rest
}) => (
	<button
		type='button'
		className='medml-viewer-action-button'
		disabled={disabled}
		style={{
			padding: compact ? '8px 6px' : '8px 12px',
			cursor: disabled ? 'not-allowed' : 'pointer',
			color: 'white',
			border: 'none',
			borderRadius: 8,
			fontSize: compact ? 15 : 20,
			fontWeight: 'bold',
			minWidth: compact ? 100 : 44,
			boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
			backgroundColor: TONE_COLORS[tone],
			opacity: disabled ? 0.6 : 1,
			...style,
		}}
		{...rest}
	>
		{children}
	</button>
)

export default ViewerActionButton
