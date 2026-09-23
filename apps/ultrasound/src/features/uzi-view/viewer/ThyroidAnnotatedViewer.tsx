import './viewer.scss'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { InputNumber, Modal, Typography, message } from 'antd'
import { UziViewer } from '@medml/viewers'
import type { ViewerImage, ViewerInstance } from '@medml/viewers'

import { useThyroidAnnotator } from './useThyroidAnnotator'
import { useRulerMeasurements } from './useRulerMeasurements'
import NodeLegendOverlay from './NodeLegendOverlay'
import SegmentsVisibilityToggle from './SegmentsVisibilityToggle'
import BrushCanvasOverlay from './BrushCanvasOverlay'
import RulerOverlay from './RulerOverlay'
import ViewerToolPanel from './ViewerToolPanel'
import {
	BRUSH_TOOL,
	CALIBRATE_TOOL,
	PAN_TOOL,
	isRulerLikeTool,
	type BrushMode,
	type ViewerToolId,
} from './constants'
import { calcPxPerMm, lineLengthPx, type MeasuredLine } from './measurement'
import { createMask, isMaskEmpty, maskToPolygon, type BrushMask } from './raster'
import type { ThyroidAnnotatedViewerProps } from './types'

/**
 * Доменная обёртка над `<UziViewer />` (`@medml/viewers`).
 *
 * Чистое управление OpenSeadragon живёт в `@medml/viewers`; здесь —
 * инструменты врача: разметка через Annotorious (`useThyroidAnnotator`),
 * кисть-заполнение поверх canvas (`BrushCanvasOverlay` + `raster.ts`),
 * произвольные измерения (`useRulerMeasurements` + `RulerOverlay`).
 */
const ThyroidAnnotatedViewer = ({
	image,
	seg,
	imageid,
	readOnly = true,
	height = 600,
	currentGroup,
	onDraftChangesChange,
	onViewerApiReady,
	thyroidStructures,
}: ThyroidAnnotatedViewerProps) => {
	const [osdViewer, setOsdViewer] = useState<ViewerInstance | null>(null)
	const [currentPage, setCurrentPage] = useState(0)

	const [activeTool, setActiveTool] = useState<ViewerToolId>(PAN_TOOL)

	// Масштаб выводится из эталонного отрезка: врач проводит линию по шкале
	// снимка и указывает её длину в миллиметрах. Автоматически коэффициент
	// взять неоткуда, а вводить его числом врач не может — пиксели на миллиметр
	// на глаз не считаются.
	const [pxPerMm, setPxPerMm] = useState<number | null>(null)

	// Отрезок, для которого ждём ввод длины. Пока он не null — открыт диалог.
	const [calibrationPx, setCalibrationPx] = useState<number | null>(null)
	const [calibrationMm, setCalibrationMm] = useState<number | null>(null)

	const [brushMode, setBrushMode] = useState<BrushMode>('draw')
	const [brushRadius, setBrushRadius] = useState(12)
	const [mask, setMask] = useState<BrushMask | null>(null)
	const [sketchVersion, setSketchVersion] = useState(0)

	const ruler = useRulerMeasurements()

	const images: ViewerImage[] = useMemo(() => {
		const list = Array.isArray(image) ? image : image ? [image] : []
		return list.map((tile, index) => ({
			id: `${imageid}-${index}`,
			url: tile.url,
			// ImageTile уже является валидным OSD tileSource ({ type: 'image', url, ... }).
			tileSource: tile as unknown as ViewerImage['tileSource'],
			width: tile.width,
			height: tile.height,
		}))
	}, [image, imageid])

	// Маска живёт в координатах снимка, поэтому её размер — размер кадра.
	useEffect(() => {
		const frame = images[currentPage]
		if (!frame?.width || !frame?.height) {
			setMask(null)
			return
		}
		setMask(createMask(frame.width, frame.height))
		setSketchVersion(v => v + 1)
	}, [images, currentPage])

	const { showSegments, toggleSegments, uniqueNodes, flushPendingSelection, addPolygonFromPoints } =
		useThyroidAnnotator({
			osdViewer,
			images,
			seg,
			tool: activeTool,
			readOnly,
			currentPage,
			currentGroup,
			thyroidStructures,
			onDraftChangesChange,
		})

	useEffect(() => {
		onViewerApiReady?.({ flushPendingSelection })
	}, [flushPendingSelection, onViewerApiReady])

	// Маска мутируется на месте, поэтому ссылка не меняется и React сам
	// пересчитать не может — версию наброска двигают штрихи и очистка.
	const hasSketch = useMemo(
		() => Boolean(mask && !isMaskEmpty(mask)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[mask, sketchVersion],
	)

	const handleClearSketch = useCallback(() => {
		const frame = images[currentPage]
		if (!frame?.width || !frame?.height) return
		setMask(createMask(frame.width, frame.height))
		setSketchVersion(v => v + 1)
	}, [images, currentPage])

	const handleConfirmSketch = useCallback(() => {
		if (!mask) return

		const polygon = maskToPolygon(mask, 2)
		if (!polygon) {
			message.warning('Набросок слишком мал — контур не построен')
			return
		}

		if (addPolygonFromPoints(polygon)) {
			message.success(`Контур создан (${polygon.length} точек)`)
			handleClearSketch()
		}
	}, [mask, addPolygonFromPoints, handleClearSketch])

	const calibrating = activeTool === CALIBRATE_TOOL

	/**
	 * Отрезок дорисован. В режиме линейки он становится измерением, в режиме
	 * калибровки — эталоном, для которого спрашиваем длину в миллиметрах.
	 */
	const handleLineDrawn = useCallback(
		(line: MeasuredLine, page: number) => {
			if (calibrating) {
				setCalibrationPx(lineLengthPx(line))
				setCalibrationMm(null)
				return
			}
			ruler.add(line, page)
		},
		[calibrating, ruler],
	)

	const applyCalibration = useCallback(() => {
		if (calibrationPx == null || calibrationMm == null) return

		const next = calcPxPerMm(calibrationPx, calibrationMm)
		if (next == null) {
			message.error('Длина должна быть больше нуля')
			return
		}

		setPxPerMm(next)
		setCalibrationPx(null)
		// Сразу возвращаем в навигацию: масштаб задают один раз.
		setActiveTool(PAN_TOOL)
		message.success(`Масштаб задан: ${next.toFixed(2)} px / мм`)
	}, [calibrationPx, calibrationMm])

	const showBrush = !readOnly && activeTool === BRUSH_TOOL

	return (
		<>
			{!readOnly && (
				<ViewerToolPanel
					activeTool={activeTool}
					onToolChange={setActiveTool}
					pxPerMm={pxPerMm}
					onResetScale={() => {
						setPxPerMm(null)
						setActiveTool(CALIBRATE_TOOL)
					}}
					brushMode={brushMode}
					onBrushModeChange={setBrushMode}
					brushRadius={brushRadius}
					onBrushRadiusChange={setBrushRadius}
					hasSketch={hasSketch}
					onConfirmSketch={handleConfirmSketch}
					onClearSketch={handleClearSketch}
					measurementCount={
						ruler.measurements.filter(item => item.page === currentPage).length
					}
					onClearMeasurements={ruler.clear}
				/>
			)}

			<UziViewer
				images={images}
				onIndexChange={setCurrentPage}
				// Инструменты выбираются в панели над снимком, встроенный
				// список тулбара не используем.
				toolbarConfig={{ tools: [] }}
				height={height}
				readOnly={readOnly}
				onInstanceReady={viewer => setOsdViewer(viewer)}
				onInstanceWillDestroy={() => setOsdViewer(null)}
				overlaySlot={() => (
					<>
						{showSegments && uniqueNodes.length > 0 && (
							<NodeLegendOverlay nodes={uniqueNodes} seg={seg} pxPerMm={pxPerMm} />
						)}

						<RulerOverlay
							viewer={osdViewer}
							active={!readOnly && isRulerLikeTool(activeTool)}
							measurements={ruler.measurements}
							currentPage={currentPage}
							pxPerMm={pxPerMm}
							labelFor={ruler.labelFor}
							onAdd={handleLineDrawn}
							onRemove={ruler.remove}
						/>

						{showBrush && (
							<BrushCanvasOverlay
								viewer={osdViewer}
								mask={mask}
								radius={brushRadius}
								erasing={brushMode === 'erase'}
								onStrokeEnd={() => setSketchVersion(v => v + 1)}
							/>
						)}
					</>
				)}
				customToolbarSlot={
					<SegmentsVisibilityToggle visible={showSegments} onToggle={toggleSegments} />
				}
			/>

			<Modal
				title='Длина эталонного отрезка'
				open={calibrationPx != null}
				onOk={applyCalibration}
				onCancel={() => setCalibrationPx(null)}
				okText='Применить'
				cancelText='Отмена'
				okButtonProps={{ disabled: calibrationMm == null || calibrationMm <= 0 }}
				destroyOnHidden
			>
				<Typography.Paragraph type='secondary'>
					Вы провели отрезок длиной {calibrationPx?.toFixed(0)} px. Укажите, скольким
					миллиметрам он соответствует по шкале снимка.
				</Typography.Paragraph>

				<InputNumber
					autoFocus
					value={calibrationMm ?? undefined}
					onChange={value => setCalibrationMm(typeof value === 'number' ? value : null)}
					onPressEnter={applyCalibration}
					min={0.1}
					step={1}
					addonAfter='мм'
					placeholder='например, 10'
					style={{ width: '100%' }}
				/>
			</Modal>
		</>
	)
}

export default ThyroidAnnotatedViewer
