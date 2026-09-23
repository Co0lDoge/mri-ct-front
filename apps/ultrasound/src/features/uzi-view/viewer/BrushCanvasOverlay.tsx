import React from 'react'
import { elementToImagePoint, imageToElementPoint, type ViewerInstance } from '@medml/viewers'
import { paintStroke, type BrushMask, type Point2D } from './raster'

export interface BrushCanvasOverlayProps {
	/** Живой инстанс OSD — нужен для перевода экранных координат в координаты снимка. */
	viewer: ViewerInstance | null
	mask: BrushMask | null
	/** Радиус кисти в пикселях изображения. */
	radius: number
	/** `true` — ластик (стирает), `false` — кисть (рисует). */
	erasing: boolean
	/** Цвет наброска. */
	color?: string
	/** Штрих завершён — снаружи обновляется превью/состояние. */
	onStrokeEnd?: () => void
}

/**
 * Слой наброска кистью поверх снимка.
 *
 * Маска хранится в координатах изображения, а канвас рисуется в координатах
 * экрана — поэтому при зуме и панорамировании он перерисовывается по событиям
 * OSD, а не пересчитывает саму маску. Так набросок не «плывёт» и не теряет
 * точность при масштабировании.
 */
const BrushCanvasOverlay: React.FC<BrushCanvasOverlayProps> = ({
	viewer,
	mask,
	radius,
	erasing,
	color = 'rgba(6, 182, 212, 0.4)',
	onStrokeEnd,
}) => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const drawingRef = React.useRef(false)
	const lastPointRef = React.useRef<Point2D | null>(null)

	// Refs здесь не нужны: обработчики ниже — обычные React-пропсы, они
	// пересоздаются на каждый рендер и уже видят актуальные значения.

	/** Экранная точка → координаты пикселя изображения. */
	const toImagePoint = React.useCallback(
		(clientX: number, clientY: number): Point2D | null => {
			const canvas = canvasRef.current
			if (!viewer || !canvas) return null

			const rect = canvas.getBoundingClientRect()
			return elementToImagePoint(viewer, clientX - rect.left, clientY - rect.top)
		},
		[viewer],
	)

	/** Перерисовка маски в текущем положении вьюпорта. */
	const redraw = React.useCallback(() => {
		const canvas = canvasRef.current
		const currentMask = mask
		if (!canvas || !viewer || !currentMask) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const rect = canvas.getBoundingClientRect()
		if (canvas.width !== rect.width || canvas.height !== rect.height) {
			canvas.width = rect.width
			canvas.height = rect.height
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height)
		if (currentMask.width === 0 || currentMask.height === 0) return

		// Маску рисуем во внеэкранный канвас в координатах изображения,
		// затем один раз натягиваем на текущий вьюпорт.
		const off = document.createElement('canvas')
		off.width = currentMask.width
		off.height = currentMask.height
		const offCtx = off.getContext('2d')
		if (!offCtx) return

		const imageData = offCtx.createImageData(currentMask.width, currentMask.height)
		const rgba = parseColor(color)
		for (let i = 0; i < currentMask.data.length; i++) {
			if (currentMask.data[i] === 1) {
				const o = i * 4
				imageData.data[o] = rgba.r
				imageData.data[o + 1] = rgba.g
				imageData.data[o + 2] = rgba.b
				imageData.data[o + 3] = rgba.a
			}
		}
		offCtx.putImageData(imageData, 0, 0)

		// Границы изображения в координатах экрана.
		const topLeft = imageToElementPoint(viewer, 0, 0)
		const bottomRight = imageToElementPoint(viewer, currentMask.width, currentMask.height)
		if (!topLeft || !bottomRight) return

		ctx.imageSmoothingEnabled = false
		ctx.drawImage(
			off,
			topLeft.x,
			topLeft.y,
			bottomRight.x - topLeft.x,
			bottomRight.y - topLeft.y,
		)
	}, [viewer, color, mask])

	// Перерисовка при движении вьюпорта.
	React.useEffect(() => {
		if (!viewer) return

		const handler = () => redraw()
		viewer.addHandler('animation', handler)
		viewer.addHandler('resize', handler)
		viewer.addHandler('open', handler)
		redraw()

		return () => {
			viewer.removeHandler('animation', handler)
			viewer.removeHandler('resize', handler)
			viewer.removeHandler('open', handler)
		}
	}, [viewer, redraw])

	const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (!mask) return
		event.currentTarget.setPointerCapture(event.pointerId)
		drawingRef.current = true

		const point = toImagePoint(event.clientX, event.clientY)
		if (point) {
			paintStroke(mask, point, point, radius, erasing ? 0 : 1)
			lastPointRef.current = point
			redraw()
		}
	}

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawingRef.current || !mask) return

		const point = toImagePoint(event.clientX, event.clientY)
		if (!point) return

		paintStroke(mask, lastPointRef.current ?? point, point, radius, erasing ? 0 : 1)
		lastPointRef.current = point
		redraw()
	}

	const endStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawingRef.current) return
		drawingRef.current = false
		lastPointRef.current = null
		try {
			event.currentTarget.releasePointerCapture(event.pointerId)
		} catch {
			/* указатель мог быть уже отпущен */
		}
		onStrokeEnd?.()
	}

	return (
		<canvas
			ref={canvasRef}
			className='brush-overlay'
			style={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				zIndex: 900,
				cursor: erasing ? 'cell' : 'crosshair',
				touchAction: 'none',
			}}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={endStroke}
			onPointerCancel={endStroke}
		/>
	)
}

/** `rgba(r, g, b, a)` или `#rrggbb` → компоненты 0..255. */
function parseColor(value: string): { r: number; g: number; b: number; a: number } {
	const rgba = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/.exec(value)
	if (rgba) {
		return {
			r: Number(rgba[1]),
			g: Number(rgba[2]),
			b: Number(rgba[3]),
			a: Math.round((rgba[4] ? Number(rgba[4]) : 1) * 255),
		}
	}

	const hex = /^#([\da-f]{6})$/i.exec(value.trim())
	if (hex) {
		const int = Number.parseInt(hex[1], 16)
		return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255, a: 102 }
	}

	return { r: 6, g: 182, b: 212, a: 102 }
}

export default BrushCanvasOverlay
