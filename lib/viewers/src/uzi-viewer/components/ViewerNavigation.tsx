import React from 'react'
import ViewerActionButton from './ViewerActionButton'

export interface ViewerNavigationProps {
	currentIndex: number
	total: number
	onPrev: () => void
	onNext: () => void
	disabled?: boolean
}

/** Кнопки "назад/вперёд" и счётчик кадров. Ничего не знает о содержимом кадров. */
const ViewerNavigation: React.FC<ViewerNavigationProps> = ({
	currentIndex,
	total,
	onPrev,
	onNext,
	disabled = false,
}) => {
	if (total <= 1) return null

	return (
		<div
			className='medml-viewer-navigation'
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 8,
			}}
		>
			<ViewerActionButton
				tone='gray'
				onClick={onPrev}
				disabled={disabled}
				aria-label='Previous image'
			>
				←
			</ViewerActionButton>

			<div
				style={{
					fontSize: 14,
					color: '#666',
					fontWeight: 'bold',
					minWidth: 60,
					textAlign: 'center',
				}}
			>
				{currentIndex + 1}/{total}
			</div>

			<ViewerActionButton
				tone='gray'
				onClick={onNext}
				disabled={disabled}
				aria-label='Next image'
			>
				→
			</ViewerActionButton>
		</div>
	)
}

export default ViewerNavigation
