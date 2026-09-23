import React, { useMemo } from 'react'
import { Flex, Typography } from 'antd'
import { FileImageOutlined } from '@ant-design/icons'
import { UziViewer, type ViewerImage } from '@medml/viewers'

import { useDziTileSource } from '@/lib/useDziTileSource'

import { useAppSelector } from '@cytology/core/hooks'
import { Tools } from '@cytology/core/types/basic'
import { ISegmentStack } from '@cytology/core/types/segments'

import { useCytologyAnnotator } from './useCytologyAnnotator'
import SegmentPopup from './SegmentPopup'
import { createSelectStyleFromConfig } from './Viewer/utils/selectStyleFromConfig'
import { IPoint } from './Viewer/interfaces/queries'

import './Viewer/viewer.scss'

/**
 * Просмотр снимка цитологии на общем движке `@medml/viewers`.
 */

interface CytologyOsdViewerProps {
	imageUrl: string
	tool: Tools
	drawingEnabled?: boolean
	selected: boolean
	needPopup?: boolean
	className?: string
	height?: number | string
	segments?: ISegmentStack[]
	segmentTypeColors?: Record<string, string>
	addSegment: (contour: IPoint[]) => void
	changeSegment: (segmentId: string, contour: IPoint[]) => void
}

const TOOLBAR_CONFIG = { showZoom: true, showFit: true, showRotate: true }

function statusMessage(text: string) {
	return (
		<Flex vertical align='center' justify='center' className='cytology-viewer-empty'>
			<FileImageOutlined className='cytology-viewer-empty-icon' />
			<Typography.Paragraph className='cytology-viewer-empty-text'>{text}</Typography.Paragraph>
		</Flex>
	)
}

const CytologyOsdViewer: React.FC<CytologyOsdViewerProps> = ({
	imageUrl,
	tool,
	drawingEnabled = false,
	selected,
	needPopup = false,
	className,
	height = 600,
	segments = [],
	segmentTypeColors = {},
	addSegment,
	changeSegment,
}) => {
	const { tileSource, isLoading, error } = useDziTileSource(imageUrl)
	const currentSegment = useAppSelector(state => state.segment.currentSegment)

	// Ссылка на массив должна быть стабильной: общий вьюер пересоздаёт инстанс
	// OSD при смене `images`, а вместе с инстансом уходит и слой разметки.
	const images = useMemo<ViewerImage[]>(
		() => (tileSource ? [{ id: imageUrl, url: '', tileSource: tileSource as ViewerImage['tileSource'] }] : []),
		[imageUrl, tileSource],
	)

	const style = useMemo(
		() =>
			createSelectStyleFromConfig(segmentTypeColors, {
				isEditMode: drawingEnabled,
				activeSegmentType: currentSegment,
			}),
		[segmentTypeColors, drawingEnabled, currentSegment],
	)

	const { annotator, attach, detach } = useCytologyAnnotator({
		segments,
		style,
		drawingEnabled: drawingEnabled && selected,
		tool,
		onAddSegment: addSegment,
		onChangeSegment: changeSegment,
	})

	const overlaySlot = useMemo(
		() => (needPopup ? <SegmentPopup annotator={annotator} isEditingMode={drawingEnabled} /> : null),
		[needPopup, annotator, drawingEnabled],
	)

	const classes = `viewer-wrapper ${className ?? ''}`

	if (!imageUrl) return <div className={classes}>{statusMessage('Изображение отсутствует')}</div>
	if (error) {
		return <div className={classes}>{statusMessage(`Не удалось загрузить изображение: ${error}`)}</div>
	}
	if (isLoading || !tileSource) {
		return <div className={classes}>{statusMessage('Загрузка изображения…')}</div>
	}

	return (
		<div className={classes}>
			<UziViewer
				images={images}
				height={height}
				toolbarConfig={TOOLBAR_CONFIG}
				navigationEnabled={false}
				onInstanceReady={attach}
				onInstanceWillDestroy={detach}
				overlaySlot={overlaySlot}
				emptyState={statusMessage('Изображение отсутствует')}
			/>
		</div>
	)
}

export default CytologyOsdViewer
