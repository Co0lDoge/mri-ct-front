import React from 'react'
import ViewerCanvas from './ViewerCanvas'
import ViewerToolbar from './ViewerToolbar'
import ViewerNavigation from './ViewerNavigation'
import ViewerPanel from './ViewerPanel'
import { useNarrowViewport } from '../hooks/useNarrowViewport'
import type {
	ToolbarConfig,
	ViewerOverlayContext,
	ViewerSlotRenderer,
} from '../types'

export interface ViewerContainerProps {
	height?: number | string
	className?: string
	containerRef: React.RefObject<HTMLDivElement>
	isEmpty: boolean
	emptyState?: React.ReactNode

	overlaySlot?: ViewerSlotRenderer
	customToolbarSlot?: ViewerSlotRenderer
	overlayContext: ViewerOverlayContext

	toolbarConfig?: ToolbarConfig | false
	zoom: number
	activeTool?: string
	onToolChange?: (toolId: string) => void
	onZoomIn: () => void
	onZoomOut: () => void
	onFit: () => void
	onRotateLeft: () => void
	onRotateRight: () => void

	navigationEnabled?: boolean
	currentIndex: number
	total: number
	onPrev: () => void
	onNext: () => void
}

function resolveSlot(
	slot: ViewerSlotRenderer | undefined,
	context: ViewerOverlayContext,
): React.ReactNode {
	if (typeof slot === 'function') {
		return slot(context)
	}
	return slot ?? null
}

/**
 * Главная обёртка лейаута 2D-вьювера: холст по центру, панель инструментов
 * и навигация справа, слот доменных оверлеев поверх холста. Сама по себе не
 * содержит доменной логики — только композицию и позиционирование.
 */
const ViewerContainer: React.FC<ViewerContainerProps> = ({
	height = 600,
	className,
	containerRef,
	isEmpty,
	emptyState,
	overlaySlot,
	customToolbarSlot,
	overlayContext,
	toolbarConfig,
	zoom,
	activeTool,
	onToolChange,
	onZoomIn,
	onZoomOut,
	onFit,
	onRotateLeft,
	onRotateRight,
	navigationEnabled = true,
	currentIndex,
	total,
	onPrev,
	onNext,
}) => {
	const showToolbarPanel = toolbarConfig !== false

	// На узких экранах вертикальная панель справа перекрывала бы снимок,
	// поэтому инструменты переезжают в горизонтальную ленту внизу.
	const isNarrow = useNarrowViewport()

	return (
		<div
			className={['medml-uzi-viewer', className].filter(Boolean).join(' ')}
			style={{ position: 'relative', width: '100%', height }}
		>
			<ViewerCanvas
				containerRef={containerRef}
				isEmpty={isEmpty}
				emptyState={emptyState}
			/>

			{resolveSlot(overlaySlot, overlayContext)}

			{showToolbarPanel && (
				<ViewerPanel
					className="medml-uzi-viewer-toolbar-panel"
					position={isNarrow ? 'bottom-bar' : 'toolbar'}
					minWidth={isNarrow ? 0 : 120}
				>
					<ViewerToolbar
						horizontal={isNarrow}
						config={toolbarConfig}
						zoom={zoom}
						activeTool={activeTool}
						onToolChange={onToolChange}
						onZoomIn={onZoomIn}
						onZoomOut={onZoomOut}
						onFit={onFit}
						onRotateLeft={onRotateLeft}
						onRotateRight={onRotateRight}
					/>

					{resolveSlot(customToolbarSlot, overlayContext)}

					{navigationEnabled && total > 1 && (
						<>
							<div
								style={
									isNarrow
										? { width: 1, alignSelf: 'stretch', backgroundColor: '#ddd', margin: '0 4px' }
										: { height: 1, backgroundColor: '#ddd', margin: '4px 0' }
								}
							/>
							<ViewerNavigation
								currentIndex={currentIndex}
								total={total}
								onPrev={onPrev}
								onNext={onNext}
							/>
						</>
					)}
				</ViewerPanel>
			)}
		</div>
	)
}

export default ViewerContainer
