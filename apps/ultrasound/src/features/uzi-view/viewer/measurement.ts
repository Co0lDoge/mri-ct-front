import type { SegmentPoint } from '../model/types'

/**
 * Измерения на снимке: длина отрезка, габариты контура и перевод пикселей
 * в миллиметры.
 *
 * Модуль чистый — без React, Annotorious и DOM, чтобы формулы можно было
 * читать и проверять отдельно от вьюера.
 */

export interface MeasuredLine {
	x1: number
	y1: number
	x2: number
	y2: number
}

/** Габариты контура в пикселях изображения. */
export interface ContourSize {
	widthPx: number
	heightPx: number
}

/**
 * Достаёт отрезок из аннотации инструмента «линия» (selector-pack рисует
 * `<line x1 y1 x2 y2>` внутри SvgSelector).
 */
export function parseLineAnnotation(annotation: unknown): MeasuredLine | null {
	const value = (annotation as { target?: { selector?: { value?: unknown } } })
		?.target?.selector?.value

	if (typeof value !== 'string') return null

	const read = (attr: string): number | null => {
		const match = new RegExp(`${attr}\\s*=\\s*"(-?[\\d.]+)"`).exec(value)
		return match ? Number.parseFloat(match[1]) : null
	}

	const x1 = read('x1')
	const y1 = read('y1')
	const x2 = read('x2')
	const y2 = read('y2')

	if (x1 == null || y1 == null || x2 == null || y2 == null) return null
	if ([x1, y1, x2, y2].some(Number.isNaN)) return null

	return { x1, y1, x2, y2 }
}

/** Длина отрезка в пикселях изображения. */
export function lineLengthPx(line: MeasuredLine): number {
	return Math.hypot(line.x2 - line.x1, line.y2 - line.y1)
}

/** Середина отрезка — точка привязки подписи с расстоянием. */
export function lineMidpoint(line: MeasuredLine): { x: number; y: number } {
	return { x: (line.x1 + line.x2) / 2, y: (line.y1 + line.y2) / 2 }
}

/**
 * Наклон отрезка в градусах для поворота подписи вдоль линии.
 *
 * Приводится к диапазону (-90°, 90°]: иначе на отрезках, проведённых
 * справа налево, текст оказывался бы вверх ногами.
 */
export function lineAngleDeg(line: MeasuredLine): number {
	const deg = (Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * 180) / Math.PI

	if (deg > 90) return deg - 180
	if (deg <= -90) return deg + 180
	return deg
}

/**
 * Положение подписи: середина отрезка, сдвинутая по нормали «вверх»
 * относительно самой линии, чтобы текст не лёг поверх неё.
 */
export function lineLabelAnchor(
	line: MeasuredLine,
	offsetPx = 12,
): { x: number; y: number; angleDeg: number } {
	const mid = lineMidpoint(line)
	const length = lineLengthPx(line)
	const angleDeg = lineAngleDeg(line)

	if (length === 0) return { x: mid.x, y: mid.y - offsetPx, angleDeg }

	// Нормаль к отрезку; знак выбран так, чтобы смещение шло вверх по экрану.
	const nx = -(line.y2 - line.y1) / length
	const ny = (line.x2 - line.x1) / length
	const sign = ny > 0 ? -1 : 1

	return {
		x: mid.x + nx * offsetPx * sign,
		y: mid.y + ny * offsetPx * sign,
		angleDeg,
	}
}

/**
 * Коэффициент масштаба: сколько пикселей приходится на миллиметр.
 * `null`, если данных недостаточно — делить на ноль нельзя.
 */
export function calcPxPerMm(lengthPx: number, lengthMm: number): number | null {
	if (!Number.isFinite(lengthPx) || !Number.isFinite(lengthMm)) return null
	if (lengthPx <= 0 || lengthMm <= 0) return null
	return lengthPx / lengthMm
}

/** Перевод пикселей в миллиметры. `null`, пока масштаб не задан. */
export function pxToMm(px: number, pxPerMm: number | null): number | null {
	if (pxPerMm == null || pxPerMm <= 0) return null
	if (!Number.isFinite(px)) return null
	return px / pxPerMm
}

/** Габариты контура по ограничивающему прямоугольнику. */
export function contourSizePx(points: SegmentPoint[]): ContourSize | null {
	if (!points || points.length === 0) return null

	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity

	for (const point of points) {
		minX = Math.min(minX, point.x)
		minY = Math.min(minY, point.y)
		maxX = Math.max(maxX, point.x)
		maxY = Math.max(maxY, point.y)
	}

	if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null

	return { widthPx: maxX - minX, heightPx: maxY - minY }
}

/**
 * Наибольшие габариты узла по всем его контурам.
 * У узла может быть несколько контуров (на разных кадрах) — берём максимум,
 * это и есть размер образования, который врач вносит в заключение.
 */
export function segmentSizePx(
	contours: Array<{ points: SegmentPoint[] }> | undefined,
): ContourSize | null {
	if (!contours || contours.length === 0) return null

	let widthPx = 0
	let heightPx = 0
	let found = false

	for (const contour of contours) {
		const size = contourSizePx(contour.points)
		if (!size) continue
		found = true
		widthPx = Math.max(widthPx, size.widthPx)
		heightPx = Math.max(heightPx, size.heightPx)
	}

	return found ? { widthPx, heightPx } : null
}

/** Форматирует миллиметры для подписи: одна цифра после запятой. */
export function formatMm(mm: number | null): string {
	if (mm == null || !Number.isFinite(mm)) return '—'
	return `${mm.toFixed(1)} мм`
}
