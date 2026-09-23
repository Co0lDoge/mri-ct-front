/**
 * Растровая маска кисти и её превращение в векторный контур.
 *
 * Модуль чистый: ни React, ни DOM, ни Annotorious. Маска — обычный
 * `Uint8Array` в координатах изображения, поэтому весь алгоритм
 * детерминирован и проверяется отдельно от вьюера.
 */

export interface BrushMask {
	width: number
	height: number
	/** 1 — закрашено, 0 — пусто. Длина = width × height. */
	data: Uint8Array
}

export interface Point2D {
	x: number
	y: number
}

export function createMask(width: number, height: number): BrushMask {
	return {
		width: Math.max(0, Math.floor(width)),
		height: Math.max(0, Math.floor(height)),
		data: new Uint8Array(Math.max(0, Math.floor(width) * Math.floor(height))),
	}
}

export function isMaskEmpty(mask: BrushMask): boolean {
	return !mask.data.some(value => value === 1)
}

/**
 * Круглый штрих кисти. `value` = 1 рисует, 0 стирает — ластик это тот же
 * штрих с нулём, отдельного алгоритма не нужно.
 */
export function paintCircle(
	mask: BrushMask,
	cx: number,
	cy: number,
	radius: number,
	value: 0 | 1,
): void {
	const r = Math.max(0.5, radius)
	const minX = Math.max(0, Math.floor(cx - r))
	const maxX = Math.min(mask.width - 1, Math.ceil(cx + r))
	const minY = Math.max(0, Math.floor(cy - r))
	const maxY = Math.min(mask.height - 1, Math.ceil(cy + r))
	const rSq = r * r

	for (let y = minY; y <= maxY; y++) {
		for (let x = minX; x <= maxX; x++) {
			const dx = x - cx
			const dy = y - cy
			if (dx * dx + dy * dy <= rSq) {
				mask.data[y * mask.width + x] = value
			}
		}
	}
}

/**
 * Штрих между двумя точками: мышь двигается рывками, и без интерполяции
 * на быстром движении оставались бы разрывы.
 */
export function paintStroke(
	mask: BrushMask,
	from: Point2D,
	to: Point2D,
	radius: number,
	value: 0 | 1,
): void {
	const distance = Math.hypot(to.x - from.x, to.y - from.y)
	const steps = Math.max(1, Math.ceil(distance / Math.max(1, radius / 2)))

	for (let i = 0; i <= steps; i++) {
		const t = i / steps
		paintCircle(
			mask,
			from.x + (to.x - from.x) * t,
			from.y + (to.y - from.y) * t,
			radius,
			value,
		)
	}
}

function isFilled(mask: BrushMask, x: number, y: number): boolean {
	if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) return false
	return mask.data[y * mask.width + x] === 1
}

/** Соседи по Муру, по часовой стрелке, начиная сверху. */
const MOORE_OFFSETS: Array<[number, number]> = [
	[0, -1],
	[1, -1],
	[1, 0],
	[1, 1],
	[0, 1],
	[-1, 1],
	[-1, 0],
	[-1, -1],
]

/**
 * Внешний контур закрашенной области — трассировка соседей по Муру
 * с критерием остановки Якоба.
 *
 * Берётся одна (первая найденная) область: врач обводит один узел, а
 * случайные отдельные мазки в контур попадать не должны.
 */
export function traceOuterContour(mask: BrushMask): Point2D[] {
	if (mask.width === 0 || mask.height === 0) return []

	// Стартовая точка: первый закрашенный пиксель при обходе сверху вниз.
	let start: Point2D | null = null
	for (let y = 0; y < mask.height && !start; y++) {
		for (let x = 0; x < mask.width; x++) {
			if (isFilled(mask, x, y)) {
				start = { x, y }
				break
			}
		}
	}
	if (!start) return []

	const contour: Point2D[] = [start]
	// Направление, откуда пришли: слева от стартового пикселя.
	let backtrackIndex = 6
	let current = start
	// Пикселей в контуре не может быть больше, чем в маске; ограничение
	// защищает от зацикливания на вырожденных фигурах.
	const maxSteps = mask.width * mask.height * 8

	for (let step = 0; step < maxSteps; step++) {
		let found = false

		for (let i = 1; i <= MOORE_OFFSETS.length; i++) {
			const index = (backtrackIndex + i) % MOORE_OFFSETS.length
			const [dx, dy] = MOORE_OFFSETS[index]
			const nx = current.x + dx
			const ny = current.y + dy

			if (isFilled(mask, nx, ny)) {
				// Откуда пришли в нового соседа — противоположное направление.
				backtrackIndex = (index + 4) % MOORE_OFFSETS.length
				current = { x: nx, y: ny }
				found = true
				break
			}
		}

		if (!found) break

		// Критерий Якоба: вернулись в старт — контур замкнут.
		if (current.x === start.x && current.y === start.y) break

		contour.push(current)
	}

	return contour
}

/** Периметр расстояния от точки до отрезка — для Douglas-Peucker. */
function perpendicularDistance(point: Point2D, a: Point2D, b: Point2D): number {
	const dx = b.x - a.x
	const dy = b.y - a.y

	if (dx === 0 && dy === 0) return Math.hypot(point.x - a.x, point.y - a.y)

	const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)
	const clamped = Math.max(0, Math.min(1, t))
	const projX = a.x + clamped * dx
	const projY = a.y + clamped * dy

	return Math.hypot(point.x - projX, point.y - projY)
}

/**
 * Упрощение контура (Douglas-Peucker).
 *
 * Трассировка даёт точку на каждый пиксель границы — для полигона это
 * избыточно: сотни точек тормозят редактор и раздувают запрос на бэкенд.
 */
export function simplifyContour(points: Point2D[], tolerance = 2): Point2D[] {
	if (points.length <= 2) return [...points]

	const first = points[0]
	const last = points[points.length - 1]

	let maxDistance = 0
	let index = 0

	for (let i = 1; i < points.length - 1; i++) {
		const distance = perpendicularDistance(points[i], first, last)
		if (distance > maxDistance) {
			maxDistance = distance
			index = i
		}
	}

	if (maxDistance <= tolerance) return [first, last]

	const left = simplifyContour(points.slice(0, index + 1), tolerance)
	const right = simplifyContour(points.slice(index), tolerance)

	// Стык дублируется — убираем одну копию.
	return [...left.slice(0, -1), ...right]
}

/**
 * Маска → готовый к отправке контур: трассировка, упрощение и отсев
 * вырожденных результатов (полигон меньше трёх точек не имеет смысла).
 */
export function maskToPolygon(mask: BrushMask, tolerance = 2): Point2D[] | null {
	const traced = traceOuterContour(mask)
	if (traced.length < 3) return null

	const simplified = simplifyContour(traced, tolerance)
	return simplified.length >= 3 ? simplified : null
}
