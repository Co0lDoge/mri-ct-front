import React from 'react'

export interface ViewerCanvasProps {
	/** Ref контейнера, на который useOpenSeadragon монтирует инстанс OSD. */
	containerRef: React.RefObject<HTMLDivElement>
	isEmpty?: boolean
	emptyState?: React.ReactNode
	className?: string
}

/**
 * Холст для монтирования OpenSeadragon. Не содержит никакой доменной логики —
 * только DOM-элемент под инстанс вьювера и опциональное состояние "нет данных".
 */
const ViewerCanvas: React.FC<ViewerCanvasProps> = ({
	containerRef,
	isEmpty = false,
	emptyState,
	className,
}) => {
	return (
		<div
			className={['medml-viewer-canvas', className].filter(Boolean).join(' ')}
			style={{ position: 'relative', width: '100%', height: '100%' }}
		>
			<div
				ref={containerRef}
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: '#f5f5f5',
				}}
			/>

			{isEmpty && emptyState && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{emptyState}
				</div>
			)}
		</div>
	)
}

export default ViewerCanvas
