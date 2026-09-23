import React, { useEffect, useMemo, useRef } from 'react'
import { useOpenSeadragon } from './hooks/useOpenSeadragon'
import ViewerContainer from './components/ViewerContainer'
import type { UziViewerProps, ViewerApi, ViewerOverlayContext } from './types'

/**
 * Главный сборочный UI-компонент 2D-вьювера (@medml/viewers/uzi-viewer).
 *
 * Полностью доменно-нейтрален: принимает только универсальные ViewerImage[],
 * управляет OpenSeadragon (zoom/pan/rotate/pagination) через useOpenSeadragon
 * и отдаёт точки расширения наружу через customToolbarSlot / overlaySlot и
 * колбэки onInstanceReady / onInstanceWillDestroy — для доменных плагинов
 * аннотирования (например, Annotorious), легенд, специфичных кнопок и т.д.
 */
const UziViewer: React.FC<UziViewerProps> = ({
	images,
	currentIndex,
	onIndexChange,
	activeTool,
	onToolChange,
	toolbarConfig,
	navigationEnabled = true,
	height = 600,
	className,
	emptyState,
	onZoomChange,
	onRotationChange,
	onViewerReady,
	onInstanceReady,
	onInstanceWillDestroy,
	customToolbarSlot,
	overlaySlot,
}) => {
	// Стабильные ref-обёртки, чтобы не пересоздавать инстанс OSD при
	// каждом ре-рендере вызывающего компонента (новые инлайн-колбэки).
	const onInstanceReadyRef = useRef(onInstanceReady)
	const onInstanceWillDestroyRef = useRef(onInstanceWillDestroy)
	onInstanceReadyRef.current = onInstanceReady
	onInstanceWillDestroyRef.current = onInstanceWillDestroy

	const {
		containerRef,
		viewer,
		currentIndex: internalIndex,
		zoom,
		rotation,
		goToIndex,
		nextIndex,
		prevIndex,
		zoomIn,
		zoomOut,
		fitToScreen,
		rotateLeft,
		rotateRight,
	} = useOpenSeadragon({
		images,
		onOpen: (osd, container) => onInstanceReadyRef.current?.(osd, container),
		onBeforeDestroy: osd => onInstanceWillDestroyRef.current?.(osd),
		onPageChange: index => onIndexChange?.(index),
		onZoomChange: level => onZoomChange?.(level),
	})

	useEffect(() => {
		onRotationChange?.(rotation)
	}, [rotation, onRotationChange])

	// Синхронизация с контролируемым currentIndex (если задан снаружи).
	useEffect(() => {
		if (typeof currentIndex === 'number' && currentIndex !== internalIndex) {
			goToIndex(currentIndex)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentIndex])

	useEffect(() => {
		if (!onViewerReady) return
		const api: ViewerApi = {
			zoomIn,
			zoomOut,
			fitToScreen,
			rotateLeft,
			rotateRight,
			goToIndex,
			getOpenSeadragonInstance: () => viewer,
		}
		onViewerReady(api)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewer, zoomIn, zoomOut, fitToScreen, rotateLeft, rotateRight, goToIndex])

	const overlayContext: ViewerOverlayContext = useMemo(
		() => ({
			currentIndex: internalIndex,
			currentImage: images[internalIndex],
			zoom,
			rotation,
			osdViewer: viewer,
			containerElement: containerRef.current,
		}),
		[internalIndex, images, zoom, rotation, viewer, containerRef],
	)

	return (
		<ViewerContainer
			height={height}
			className={className}
			containerRef={containerRef}
			isEmpty={images.length === 0}
			emptyState={emptyState}
			overlaySlot={overlaySlot}
			customToolbarSlot={customToolbarSlot}
			overlayContext={overlayContext}
			toolbarConfig={toolbarConfig}
			zoom={zoom}
			activeTool={activeTool}
			onToolChange={onToolChange}
			onZoomIn={zoomIn}
			onZoomOut={zoomOut}
			onFit={fitToScreen}
			onRotateLeft={rotateLeft}
			onRotateRight={rotateRight}
			navigationEnabled={navigationEnabled}
			currentIndex={internalIndex}
			total={images.length}
			onPrev={prevIndex}
			onNext={nextIndex}
		/>
	)
}

export default UziViewer
